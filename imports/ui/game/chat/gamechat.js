import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Messages } from '../../../api/messages.js';
import { Players } from '../../../api/players.js';

import './gamechat.html';

Template.gamechat.helpers({
	messages: () => {
		let player = Players.findOne({ id: Session.get('id') });
		let messageFilters = [{ id: 'global' }, { id: player.id }];

		if (player.role.chat) {
			messageFilters.push({ id: player.role.chat });
		}

		return Messages.find({ $or: messageFilters });
	}
});

Template.gamechat.events({
	'click .send': (event, template) => {
		event.preventDefault();

		let player = Players.findOne({ id: Session.get('id') });
		let messageBox = template.find('input:text[name=messagebox]');
		let message = messageBox.value;

		messageBox.value = "";
			
		if (!player.role.chat) {
			return;
		}

		Messages.insert({
			id: player.role.chat,
			from: Players.findOne({ id: Session.get('id') }).name,
			content: message
		});
	}
});

Template.gamechat.onRendered(() => {
	let container = Template.instance().find('.chat-container');
	container.scrollTop = container.scrollHeight - container.clientHeight;
});
