import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { Rooms } from '../api/rooms.js';
import { Games } from '../api/games.js';
import { Players } from '../api/players.js';

import { Phases } from '../types/phases.js';

import './player.html';

Template.player.helpers({
	role() {
		return Players.find({ id: Session.get('id') }).fetch()[0].role.name;
	},
	showConversation() {
		return Games.find({ }).fetch()[0].state === Phases.Conversation;
	},
	showAcusing() {
		return Games.find({ }).fetch()[0].state === Phases.Accusation;
	},
	showVoting() {
		return Games.find({ }).fetch()[0].state === Phases.Lynching;
	},
	showNight() {
		return Games.find({ }).fetch()[0].state === Phases.Night;
	},
	showNightMessages() {
		return Games.find({ }).fetch()[0].state === Phases.NightMessage;
	},
	gameOver() {
		return Games.find({ }).fetch()[0].state === Phases.GameOver;
	},
	showWait() {
		return true;
	},
	amDead() {
		return Players.find({ id: Session.get('id') }).fetch()[0].dead;
	}
});