/* global $ */
/* global requirejs */

'use strict';
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

exports.showChatDialog = function() {
	$('#modalChatBody').html("<iframe src='http://discordi.deliriousdrunkards.com/render?id=143528950834921472&title=SteamPool&theme=dark&join=true&abc=false&showall=true&toggle=false'class='js-external-link' width='300px' height='400px' frameborder='0'></iframe>");
	$('#modalChat').modal('show');
}

exports.init = function() {
	ipc.on('showChatDialog', exports.showChatDialog);
}
