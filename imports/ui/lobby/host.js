import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Players } from '../../api/players.js';

import './host.html';

Template.host.helpers({
	players: () => {
		return Players.find({ });
	}
});

Template.host.events({
	'click .start-game': (event) => {
		event.preventDefault();
		
		Meteor.call('startGame');
	}
});
