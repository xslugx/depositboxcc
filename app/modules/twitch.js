/* global $ */
/* global requirejs */

'use strict';
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

exports.init = function() {
	ipc.on('showTwitchDialog', exports.showTwitchDialog);
}

exports.showTwitchDialog = function() {
	$('#modalTwitch').modal('show');
}
