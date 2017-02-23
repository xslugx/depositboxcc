'use strict';

var app = require('app');
var Menu = require('menu');
var shell = require('shell');
var BrowserWindow = require('browser-window');
var ipc = require("electron-safe-ipc/host");
var env = require('./electron_boilerplate/env_config');

exports.init = function () {
	ipc.on('processStarted', function() { exports.buildMenu(true); });
	ipc.on('processTerminated', function() { exports.buildMenu(false); });
	exports.buildMenu();
}

exports.buildMenu = function (processRunning) {
	// File
	var menuTemplate = [{
		label: 'File',
		submenu: [{
			label: 'Quit',
			accelerator: 'CmdOrCtrl+Q',
			click: function () {
				app.quit();
			}
		}]
	}];

	// View
	var viewSubmenu = [{
			label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
			click: function () {
				BrowserWindow.getFocusedWindow().reloadIgnoringCache();
			}
		}];
/*		if(env.name == 'development' || env.name == 'releases') {
						viewSubmenu.push({
							label: 'Toggle Dev Tools',
							accelerator: 'Shift+CmdOrCtrl+J',
							click: function () {
								BrowserWindow.getFocusedWindow().toggleDevTools();
							}
						})
	} */
	menuTemplate.push({
		label: 'View',
		submenu: viewSubmenu
	});

	menuTemplate.push({
		label: 'Help',
		submenu: [{
			label: 'Check for Updates',
			click: function () {
				ipc.send("checkForUpdates");
			}
		},{
			label: 'About Depositbox',
			accelerator: 'Shift+CmdOrCtrl+A',
			click: function () {
				ipc.send("showAboutDialog");
			}
		},{
			label: 'Changelog',
			click: function () {
				ipc.send("showChangeDialog");
			}
		},]
	});

/*	menuTemplate.push({
		label: 'Discord',
		submenu: [{
			label: 'Chat',
			click: function () {
				ipc.send("showChatDialog");
			}
		},]
	}); */

	var appMenu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(appMenu);
};
