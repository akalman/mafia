import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../../api/players.js'

import './join-game.html';

Template.body.events({
	'click .join-game': (event) => {
		event.preventDefault();

		var name = event.currentTarget.previousElementSibling.value;
		Players.insert({ name: name, id: Session.get('id') });
	}
});
