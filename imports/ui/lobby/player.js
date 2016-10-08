import { Template } from 'meteor/templating';

import { Players } from '../../api/players.js';

import './player.html';

Template.player.helpers({
	players() {
		return Players.find({ });
	}
});
