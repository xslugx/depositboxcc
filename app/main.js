/* global __dirname */
'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./lib/electron_boilerplate/env_config');
var windowStateKeeper = require('./lib/electron_boilerplate/window_state');
var ipc = require('ipc');
// var mine = require('./modules/miner.js')
const electron = require('electron');
const Menu = electron.Menu;
const Tray = electron.Tray;
var path = require('path');


var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('mainWindow', {
	width: 850,
	height: 700
});

var iconPath = path.join(__dirname, '/images/icon.png');
var appIcon = null;
app.on('ready', function () {
/*	appIcon = new Tray(iconPath);
	var contextMenu = Menu.buildFromTemplate([
	{
	label: 'Settings',
  submenu: [
				{ label: 'Start', type: 'radio', checked: true, clicked: mine.mine() },
				{ label: 'Stop', type: 'radio', clicked: mine.stopMining() },
				{ label: 'Run on Startup', type: 'checkbox'},
		]
	}
]);
	appIcon.setToolTip('SteamPool');
	appIcon.setContextMenu(contextMenu); */

	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	});

	if (mainWindowState.isMaximized) {
		mainWindow.maximize();
	}

	require('./lib/menu').init();
	mainWindow.loadUrl('file://' + __dirname + '/depositbox.html');

	if (env.showDevTools) {
		mainWindow.openDevTools();
	}

	mainWindow.on('close', function () {
		mainWindowState.saveState(mainWindow);
//		appIcon.destroy()
	});
});

app.on('window-all-closed', function () {
	app.quit();
//	appIcon.destroy()
});
