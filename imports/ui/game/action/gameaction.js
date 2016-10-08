import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Actions } from '../../../api/actions.js';
import { Players } from '../../../api/players.js';

import { Roles } from '../../../types/roles.js';

import './gameaction.html';

Template.gameaction.helpers({
	role: () => {
		return Players.findOne({ id: Session.get('id') }).role.name;
	},
	hasAction: () => {
		return !!Players.findOne({ id: Session.get('id') }).role.menu;
	},
	players: () => {
		let player = Players.findOne({ id: Session.get('id') });

		return Players
			.find({ })
			.map(p => {
				let newP = Object.create(p);
				newP.canAct = Roles[player.role.name].menuFilter(newP, Session);
				return newP;
		});
	}
});

Template.gameaction.events({
	'click .action-target': (event, template) => {
		event.preventDefault();

		let player = Players.findOne({ id: Session.get('id') });
		let action = Actions.findOne({ id: Session.get('id') });
		let value = event.target.value;

		if (action) {
			Actions.update(action._id, { $set: { value: value } });
		}
		else {
			Actions.insert({
				id: Session.get('id'),
				value: value,
				type: player.role.name,
				priority: player.role.priority
			});
		}
	}
});
