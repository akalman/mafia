import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Votes } from '../../../api/votes.js';
import { Lynchs } from '../../../api/lynchs.js';

import './lynching.html';

Template.lynching.helpers({
	target: () => {
		return Lynchs.findOne({ }).name;
	},
	amTarget: () => {
		return Lynchs.findOne({ }).id === Session.get('id');
	}
});

Template.lynching.events({
	'click .yes': (event) => {
		event.preventDefault();

		let vote = Votes.findOne({ id: Session.get('id') });

		if (!!vote) {
			Votes.update(vote._id, { $set: { value: 'yes' } });
		}
		else {
			Votes.insert({ id: Session.get('id'), value: 'yes' });
		}
	},
	'click .no': (event) => {
		event.preventDefault();

		let vote = Votes.findOne({ id: Session.get('id') });

		if (!!vote) {
			Votes.update(vote._id, { $set: { value: 'no' } });
		}
		else {
			Votes.insert({ id: Session.get('id'), value: 'no' });
		}
	}
});
