import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { Games } from '../api/games.js';
import { Players } from '../api/players.js';

import './body.html';

import './lobby/lobby.js';
import './game/game.js';

Session.set('id', Random.id());

Template.body.helpers({
	debug: () => {
		return true;
	},
	id: () => {
		return Session.get('id');
	},
	gameStarted: () => {
		return !!Games.findOne({ });
	}
});

Template.body.events({
	'click .nuke': (event) => {
		event.preventDefault();

		Meteor.call('nuke');
	}
});
