import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Games } from '../../api/games.js';
import { Voices } from '../../api/voices.js';

import { Phases } from '../../types/phases.js';

import './gamehost.html';

let messages = [];
let playFn = () => {
	if (responsiveVoice.isPlaying()) {
		setTimeout(playFn, 0);
	} else {
		responsiveVoice.speak(messages.shift(), "UK English Male");
		if (messages.length > 0) {
			setTimeout(playFn, 0);
		}
	}
};

Template.gamehost.onCreated(() => {
	Voices.find({ }).observe({
		added: (voice) => {
			messages.push(voice.content);
			if (messages.length === 1) {
				setTimeout(playFn, 0);
			}
		}
	});

	responsiveVoice.speak('the game has started.  it is day time.', "UK English Male");
});

Template.gamehost.helpers({
	state: () => {
		return Games.findOne({ }).state;
	},
	gameOver: () => {
		return Games.findOne({ }).state === Phases.GameOver;
	}
});

Template.gamehost.events({
	'click .next-phase': (event) => {
		event.preventDefault();
		Meteor.call('nextPhase');
	}
});
