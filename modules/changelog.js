/* global $ */
/* global requirejs */

'use strict';
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

exports.showChangeDialog = function() {
	$('#modalChangeBody').html("<b>v0.4.0</b> <li>Processing now runs when you are idle, automatically turning off when you return to your computer. You can enable this feature in the settings cog next to the start button. </li> <li>New faster backend software the supports newer CUDA cards</li> <li>Funny startup lines while the program is starting. Tweet us suggestions for future startup lines.</li> <li>Payouts now require a password in order to protect your funds! Set one now at http://bit.ly/2e5OUHd</li> <b>v0.3.9</b> <li>Inputs are now saved in the withdrawal tab along with a new $1 minimum.</li> <li>In order to help promote steampool a user is now asked to share once a withdrawal has been submitted for payout.</li> <b>v0.3.8</b> <li>Added the ability to request a withdrawal from within the client. Currently only supports Papal withdrawals but more to come.</li> <li>Fixed NaN being displayed when a processing speed was being calculated.</li> <b>V0.3.7</b> <li>Major bug fixed where the client sometimes got stuck donating to charity instead of earning money for the user.</li> <b>V0.3.6</b> <li>Start button now shows information regarding speed of computer and information regarding when the client is done creating needed files.</li> <li>The community chat has moved from Slack to Discord based on community input. Join by clicking the Discord image under the balance bar.</li> <li> SteamPool now has a new support system for users who need help. File a ticket at help.steampool.com if you have a question or need help using the client.</li> <b>V0.3.5</b> <li>Users who have both onboard graphics cards and external graphics cards can now use SteamPool without needing to uninstall their onboard graphics card. </li> <li>SteamPool now has a \"Share Your Love\" feature. Allowing users to show off their support for SteamPool by sharing on social media.</li> <li>You now can check the changelog in the help menu here and will show one time on launch for all future updates.</li>");
	$('#modalChange').modal('show');
}

exports.init = function() {
	ipc.on('showChangeDialog', exports.showChangeDialog);
	var localVersion = localStorage.getItem('version');
	var walkthrough = localStorage.getItem('walkthrough_end');
	if (localVersion != pjson.version && walkthrough == "yes" ) {
		exports.showChangeDialog()
		console.log('showchangeDialog')
	}
	localStorage.setItem('version', pjson.version);
}
