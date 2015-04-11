(function(exports) {
	"use strict";
	
	var api = {
		get: _get,
		put: _put,
		setConf : _setConf
	};
	var defaultConf = {
		path : "/home/lolobstant/tmp/"
	};
	extend(exports, api);

	var Q = require('q'),
		fs = require('fs');

	function extend(obj) {
		var args = [].slice.call(arguments, 1);
		args.forEach(function(source) {
			for (var prop in source) {
				if (source.hasOwnProperty(prop))
					obj[prop] = source[prop];
			}
		});
		return obj;
	}
	
	function _get(fileName)
	{
		return Q.Promise(function(resolve, reject) {
			var stream = fs.createReadStream(defaultConf.path + fileName);
			stream.on("error", function(error) {
				reject(error);
			});
			stream.on("readable", function() {
				resolve(stream);
			});
		});
	}
	
	function _put(stream, fileName)
	{
		if (!fileName)
			filename = "noname.tmp" // do cool stuff here
			
		console.log("very put");
		return Q.Promise(function(resolve, reject) {
			try {
				console.log('path :', defaultConf.path + fileName, fileName);
				var file = fs.createWriteStream(defaultConf.path+fileName);
				stream.pipe(file);
				file.on('error', function(err) {
					reject(err);
				})
				stream.on('error', function(err) {
					reject(err);
				})
				file.on("finish", function() {
					resolve("file uploaded");
				})
			} catch(e) {
				console.log(e);
				reject(e);
			}
		});
	}
	
	function _setConf(userConf)
	{
		for (var i in userConf) {
			if (userConf.hasOwnProperty(i) && i in defaultConf)
				defaultConf[i] = userConf[i];
		}
	}

})(module.exports);