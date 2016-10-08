import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../../api/players.js';
import { Rooms } from '../../api/rooms.js';

import { Phases } from '../../types/phases.js';

import './game.html';

import './gamehost.js';
import './gameview.js';
import './gameover.js';
import './action/gameaction.js';
import './chat/gamechat.js';
import './state/gamestate.js';
import './state/accusing.js';
import './state/lynching.js';

Template.game.helpers({
	isHost: () => {
		return !!Rooms.findOne({ owner: Session.get('id') });
	},
	isDead: () => {
		return !!Players.findOne({ id: Session.get('id'), dead: true });
	}
});
