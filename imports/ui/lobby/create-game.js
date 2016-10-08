import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Rooms } from '../../api/rooms.js';

import './create-game.html';

Template.creategame.events({
	'click .create-game': (event) => {
		event.preventDefault();

		Rooms.insert({ owner: Session.get('id') });
	}
});
