/* global $ */
/* global requirejs */

'use strict';
var ipc = require('electron-safe-ipc/guest');
var pjson = require('./package.json');

var tour;

exports.init = function() {
	// Instance the tour
	tour = new Tour({
		name: 'walkthrough',
		debug: true,
		onStart: function(tour) {
			console.log("Tour started");
		},
		onNext: function(tour) {
			console.log("Step changed");
		},
		onEnd: function(tour) {
			console.log("Tour ended");
		},
		onRedirectError: function(tour) {
			console.log("Redirect error occured");
		}
	});

	tour.addSteps([
		{
			element: '#emailField',
			title: 'Enter Your Email',
			content: 'This is used to track your earnings.',
			placement: 'bottom',
			backdrop: true,
			autoscroll: true,
			backdropPadding: {
				bottom: 3,
				right: 3
			}
		},
		{
			element: '.btn-settings',
			title: 'Settings',
			content: 'Click the cog below to edit your settings and preferences. Make sure to check "Run When Idle" which will allow you to earn money while afk',
			placement: 'left',
			autoscroll: true
		},
		{
			element: '#startButton',
			title: 'Get Started',
			content: 'Click the start button to start earning money towards a future game.',
			placement: 'top',
			autoscroll: true
		},
		{
			element: '.progress',
			title: 'Track Your Earnings',
			content: 'Estimated earnings are updated in real time and can move up and down based on how long you run the program. Earnings are locked in every four hours and initial estimated earnings take about 10 minutes to show up.',
			backdrop: true,
			backdropPadding: {
				top: 0,
				bottom: 0
			},
			placement: 'top',
			autoscroll: true
		},
		{
			element: '.tour-media',
			title: 'Show Your Appreciation',
			content: 'Follow us on Twitter and join our chat on Discord for updates and giveaways',
			backdrop: true,
			backdropPadding: {
				top: 5,
				bottom: -5
			},
			placement: 'top',
			autoscroll: true
		},
		{
			element: '#twitchStreamer',
			title: 'Support a Streamer',
			content: 'Donate a percentage of your earnings to your favorite Twitch streamer of your choice, helping them produce great content. Simply enter their Twitch username.',
			placement: 'left',
			container: '#modalTwitch',
			orphan: true,
			autoscroll: true,
			onShow: function() {
				$('#modalTwitch').modal('show');
				localStorage.setItem('walkthrough_end', 'yes');
			},
			onHide: function() {
				$('#modalTwitch').modal('hide');
			}
		}
	])

	// Initialize the tour
	tour.init();

	// Start the tour
	tour.start();

};
