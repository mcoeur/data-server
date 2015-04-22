(function (exports) {
	"use strict";
	var Q    = require('q'),
		fs   = require('fs'),
		path = require('path');
	var defaultPath = path.resolve(__dirname, '../tmp/');
	if (!fs.existsSync(defaultPath))
		fs.mkdirSync(defaultPath);
	var api         = {
			get:     _get,
			put:     _put,
			setConf: _setConf
		},
		defaultConf = {
			path: defaultPath
		};
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

	function _get(fileName) {
		return Q.Promise(function (resolve, reject) {
			var filePath = path.resolve(defaultConf.path, fileName)
			var stream = fs.createReadStream(filePath);
			stream.on("error", function (error) {
				reject(error);
			});
			stream.on("readable", function () {
				resolve(stream);
			});
		});
	}

	function _put(stream, fileName) {
		if (!fileName)
			fileName = "noname.jpg" // do cool stuff here

		var filePath = path.resolve(defaultConf.path, fileName)
		return Q.Promise(function (resolve, reject) {
			try {
				var file = fs.createWriteStream(filePath);
				stream.pipe(file);
				stream.on('error', reject);
				file.on('error', reject)
					.on("finish", function () {
						resolve({name:fileName});
					});
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	}

	function _setConf(userConf) {
		for (var i in userConf) {
			if (userConf.hasOwnProperty(i) && i in defaultConf)
				defaultConf[i] = userConf[i];
		}
	}

})(module.exports);