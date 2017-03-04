/* global $ */
/* global requirejs */

'use strict';
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');
var fs = require('fs');
var path = require('path');

exports.init = function() {
	ipc.on('showPayoutDialog', exports.showPayoutDialog);
}

exports.showPayoutDialog = function() {
	$('#modalPayout').modal('show');

	var addr = localStorage.Email;
  	var url = "http://weipool.org/spbalance/" + addr;
  	$.get(url, function(body) {
    var ethbalance = JSON.parse(body);
    $.get("https://api.bitcoinaverage.com/ticker/USD/last", function(body) {
	      var btcusd = JSON.parse(body);
	      $.get("https://coinmarketcap-nexuist.rhcloud.com/api/eth/price", function(x) {
	        var ethbtcvalue = x.btc;
	        var usdethvalue = btcusd * ethbtcvalue;
	        window.balance = (ethbalance * usdethvalue); //20 is 100/20 which gives us 5 our base payout
	      });
	    });
	 });

	var filePath = path.resolve(__dirname, 'modules', 'payout.html');
	fs.readFile(filePath, (err, data) => {
		if (err) throw err;
		$('#modalPayoutBody').html(data.toString());
	});
}
