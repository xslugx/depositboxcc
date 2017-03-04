/* global $ */
/* global requirejs */

'use strict';
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

exports.init = function() {
	ipc.on('showAboutDialog', exports.showAboutDialog);
}

exports.showAboutDialog = function() {
	$('#modalAboutBody').text("Steam Pool Version " + pjson.version );
	$('#modalAbout').modal('show');
}
