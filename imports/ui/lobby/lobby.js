import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../../api/players.js';
import { Rooms } from '../../api/rooms.js';

import './lobby.html';

import './create-game.js';
import './host.js';
import './player.js';
import './join-game.js';

Template.lobby.helpers({
	roomDoesNotExist: () => {
		return !Rooms.findOne({ });
	},
	isHost: () => {
		return !!Rooms.findOne({ owner: Session.get('id') });
	},
	isPlayer: () => {
		return !!Players.findOne({ id: Session.get('id') });
	}
});
