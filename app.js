(function (exports) {
	"use strict";

	var api = {
		run: _run
	};
	extend(exports, api);

	var app         = require('express')(),
	    morgan      = require("morgan"),
	    cors        = require('cors'),
	    busboy      = require('connect-busboy'),
	    Q           = require('q'),
	    defaultConf = {
		    port:         8080,
		    provider:     "filesystem",
		    providerConf: {}
	    },
	    provider;

	function extend(obj) {
		var args = [].slice.call(arguments, 1);
		args.forEach(function (source) {
			for (var prop in source) {
				if (source.hasOwnProperty(prop))
					obj[prop] = source[prop];
			}
		});
		return obj;
	}

	function _run(userConf) {
		var conf = merge(defaultConf, userConf);

		provider = getProvider(conf.provider);
		app.use([
			morgan("dev"),
			busboy(),
			cors()
		]);

		app.post("*", function (req, res) {
			var seq;
			if (req.headers["content-type"].indexOf('multipart/form-data') != -1)
				seq = upload_multipart(req);
			else
				seq = upload_raw(req);
			seq.then(function (data) {
				res.status(200).send('very put');
			}, function (err) {
				console.log("err : ", err);
				res.status(404).send('not found =(');
			});
		});

		app.get("*", function (req, res) {
			provider.get(req.url.substring(1)).then(function (stream) {
				stream.pipe(res.status(200));
			}, function (err) {
				res.status(404).send('not found =(');
			});
		});

		app.listen(conf.port, function () {
			console.log("running on port " + conf.port);
		});
	}

	function upload_multipart(req) {
		var deferred = Q.defer();
		try {
			req.pipe(req.busboy);
			req.busboy.on('file', function (fieldname, stream, filename) {
				console.log('to put : ', filename);
				provider.put(stream, filename).then(deferred.resolve, deferred.reject);
			});
		}
		catch (e) {
			deferred.reject(e);
		}
		return deferred.promise;
	}

	function upload_raw(req, res) {
		return provider.put(req);
	}

	function merge(source, mix) {
		var res = source;
		for (var i in mix) {
			if (mix.hasOwnProperty(i) && i in source)
				res[i] = mix[i];
		}
		return res;
	}

	function getProvider(providerName) {
		var provider;
		try {
			provider = require("./providers/" + providerName);
			if (typeof provider.get !== 'function' ||
				typeof provider.put !== 'function' ||
				typeof provider.setConf !== 'function')
				throw new Error('Provider: ' + providerName + ' malconstruct');
			provider.setConf(defaultConf.providerConf);
		} catch (e) {
			provider = {
				get: function () {
					throw new Error('Invalid provider');
				},
				put: function () {
					throw new Error('Invalid provider');
				}
			};
			console.error(e);
		}
		return provider;
	}

})(module.exports);