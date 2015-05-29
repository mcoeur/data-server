(function (exports) {
	"use strict";
	var Q	= require('q'),
		AWS	= require("aws-sdk"),
		util = require('util'),
		stream = require('stream');

	var api         = {
			get:     _get,
			put:     _put,
			setConf: _setConf
		},
		defaultConf = {},
		s3 = null;
		
	extend(exports, api);

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
	
	var createReadStream = function (object, options) {
		return new MultiStream (object, options);
	};
	
	var MultiStream = function (object, options) {
		if (object instanceof Buffer || typeof object === 'string') {
			options = options || {};
			stream.Readable.call(this, {
				highWaterMark: options.highWaterMark,
				encoding: options.encoding
			});
		} else {
			stream.Readable.call(this, { objectMode: true });
		}
			this._object = object;
	};
	
	util.inherits(MultiStream, stream.Readable);
	
	MultiStream.prototype._read = function () {
		this.push(this._object);
		this._object = null;
	};
	

	function _get(fileName) {
		return Q.Promise(function (resolve, reject) {
			var params = {
				"Key" : fileName,
				"Bucket" : defaultConf.bucket
			};
			s3.getObject(params, function(err, object)
			{
				if (err)
					reject();
				else
					resolve(createReadStream(object.Body));
			});
		});
	}

	function _put(stream, fileName) {
		return Q.Promise(function (resolve, reject) {
			var params = {
				"Key" : fileName,
				"Bucket" : defaultConf.bucket,
				"Body" : stream
			};
			s3.upload(params, function(err, data) {
				if (err)
					reject(err);
				else
					resolve({name:fileName});
			});
		});
	}

	function _setConf(userConf) {
		defaultConf = userConf;
		AWS.config.update({
			accessKeyId: defaultConf.accessKeyId,
			secretAccessKey: defaultConf.secretAccessKey
		});
		s3 = new AWS.S3();
	}

})(module.exports);