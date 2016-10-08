import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var'

import './gameview.html';

let view = ReactiveVar('state');

Template.gameview.helpers({
	inChat: () => {
		return view.get() === 'chat';
	},
	inAction: () => {
		return view.get() === 'action';
	}
});

Template.gameview.events({
	'click label': (event) => {
		view.set(event.target.firstElementChild.id);
	}
});
