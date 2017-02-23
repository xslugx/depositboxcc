/* global $ */
/* global requirejs */

'use strict';

var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');


exports.init = function() {
	ipc.on('checkForUpdates', exports.checkForUpdates);
	exports.checkForUpdates(true);
	console.log('Checking for Update')
}

exports.checkForUpdates = function(bSilentCheck) {
		$.get(pjson.config.versionCheckURL, function (body) {
				var json = JSON.parse(body);
				if(json.version > pjson.version) {
					$('#modalUpdateAvailable').modal('show');
				} else if(!bSilentCheck) {
					$('#modalNoUpdateAvailable').modal('show');
				}
		})
}
