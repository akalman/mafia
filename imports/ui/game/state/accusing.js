import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Players } from '../../../api/players.js';
import { Votes } from '../../../api/votes.js';

import './accusing.html';

Template.accusing.helpers({
	players: () => {
		return Players.find({ dead: false });
	},
	isNotMe: (id) => {
		return id !== Session.get('id');
	}
});

Template.accusing.events({
	'click .acuse': (event) => {
		event.preventDefault();

		let vote = Votes.findOne({ id: Session.get('id') });
		let value = event.target.value;

		if (!!vote) {
			Votes.update(vote._id, { $set: { value: value } });
		}
		else {
			Votes.insert({ id: Session.get('id'), value: value });
		}
	}
});