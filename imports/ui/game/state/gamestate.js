import { Template } from 'meteor/templating';

import { Games } from '../../../api/games.js';

import { Phases } from '../../../types/phases.js';

import './gamestate.html';

Template.gamestate.helpers({
	state: () => {
		return Games.findOne({ }).state;
	},
	isAccusing: () => {
		return Games.findOne({ }).state === Phases.Accusation;
	},
	isLynching: () => {
		return Games.findOne({ }).state === Phases.Lynching;
	}
});
