import { Meteor } from 'meteor/meteor';

import { Rooms } from '../imports/api/rooms.js';
import { Players } from '../imports/api/players.js';
import { Games } from '../imports/api/games.js';
import { Votes } from '../imports/api/votes.js';
import { Lynchs } from '../imports/api/lynchs.js';
import { Messages } from '../imports/api/messages.js';
import { Actions } from '../imports/api/actions.js';
import { Voices } from '../imports/api/voices.js';

import { Teams } from '../imports/types/teams.js';
import { Roles } from '../imports/types/roles.js';
import { Phases } from '../imports/types/phases.js'

import { generateRoles } from '../imports/core/generateRoles.js';

const nextPhase = {
	[Phases.Conversation]: Phases.Accusation,
	[Phases.Accusation]: Phases.Lynching,
	[Phases.Lynching]: Phases.Night,
	[Phases.Night]: Phases.Conversation
};

function checkGameOver() {
	let remainingPlayers = Players
	.find({ dead: false })
	.map(p => p.role.alignment);

	let remainingTeams = { };
	for (let i = 0; i < remainingPlayers.length; i++) {
		remainingTeams[remainingPlayers[i]] = true;
	}

	if (Object.keys(remainingTeams).length === 1) {
		Games.update(Games.findOne({ })._id, { $set: { state: Phases.GameOver } });
		Voices.insert({
			content: 'Game over. '
				+ Object.keys(remainingTeams)[0]
				+ ' wins'
		});
		Messages.insert({
			id: 'global',
			from: 'global',
			content: 'Game over. '
				+ Object.keys(remainingTeams)[0]
				+ ' wins'
		});
	}
}

function kill(id) {
	let player = Players.findOne({ id: id });

	if (player.isImmune) {
		return false;
	}

	Players.update(player._id, { $set: { dead: true } });
	return true;
}

function ensureMafiaHasKillRole() {
	let mafioso = Players.findOne({ 'role.name': Roles.Mafioso.name, dead: false });
	if (!!mafioso) {
		return;
	}
	console.log('creating new mafioso');

	let nextMafioso = Players.findOne({ 'role.alignment': Teams.Mafia, dead: false });
	if (!nextMafioso) {
		return;
	}
	console.log('found new mafioso');

	Players.update(nextMafioso._id, { $set: { role: Roles.Mafioso } });
	Messages.insert({
		id: nextMafioso.id,
		from: 'you',
		content: 'You have become the Mafioso'
	});
}

function simpleKillAction(action, player, target, source) {
	let result = kill(action.value);
	if (result) {
		Messages.insert({ id: player.id, from: 'you', content: 'You successfully killed ' + target.name });
		Messages.insert({ id: target.id, from: 'you', content: 'You were killed' });
		Voices.insert({
			content: target.name
				+ ' was killed by '
				+ source
				+ '.  Their role was '
				+ target.role.name
		});
		Messages.insert({
			id: 'global',
			from: 'global',
			content: target.name
				+ ' was killed by '
				+ source
				+ '.  Their role was '
				+ target.role.name
		});
	} else {
		Messages.insert({ id: player.id, from: 'you', content: target.name + ' was immune' });
		Messages.insert({ id: target.id, from: 'you', content: 'Someone tried to kill you but you were immune' });
	}
}

Meteor.startup(() => {
	return Meteor.methods({
		nuke() {
			Rooms.remove({ });
			Players.remove({ });
			Games.remove({ });
			Votes.remove({ });
			Lynchs.remove({ });
			Messages.remove({ });
			Actions.remove({ });
			Voices.remove({ });
		},
		startGame() {
			let players = Players.find({ }).fetch();
			if (players.length < 5) {
				return;
			}

			let roleOrder = generateRoles(players.length);
			Games.insert({ state: Phases.Conversation });

			for (let i = 0; i < players.length; i++) {
				Players.update(players[i]._id, { $set: {
					role: roleOrder[i],
					isImmune: roleOrder[i].isImmune || false,
					dead: false
				} });
			}
		},
		nextPhase() {
			let game = Games.find({ }).fetch()[0];

			switch(game.state) {
				case Phases.Conversation:
					Voices.insert({ content: 'begin acusing' });
					Messages.insert({ id: 'global', from: 'global', content: 'begin accusing' });
					break;
				case Phases.Accusation:
					let votes = Votes.find({ }).fetch();
					let playerVotes = { };
					for (let i = 0; i < votes.length; i++) {
						if (playerVotes[votes[i].value] === undefined) {
							playerVotes[votes[i].value] = 0;
						}
						playerVotes[votes[i].value] = playerVotes[votes[i].value] + 1;
					}

					let target = [];
					let targetInterest = 0;
					let players = Object.keys(playerVotes);
					for (i = 0; i < players.length; i++) {
						if (playerVotes[players[i]] === targetInterest) {
							target.push(players[i]);
						}
						if (playerVotes[players[i]] > targetInterest) {
							target = [players[i]];
							targetInterest = playerVotes[players[i]];
						}
					}

					if (targetInterest > (Players.find({ dead: false }).count() / 2)) {
						for (i = 0; i < target.length; i++) {
							Lynchs.insert({
								id: players[i],
								name: Players.find({ id: players[i]}).fetch()[0].name
							});
						}
					}

					Votes.remove({ });

					if (Lynchs.find({ }).count() === 0) {
						game.state = nextPhase[game.state];
						Voices.insert({ content: 'It is now night time' });
						Messages.insert({ id: 'global', from: 'global', content: 'It is now night time' });
					} else {
						Voices.insert({ content: 'Someone is on trial' });
						Messages.insert({ id: 'global', from: 'global', content: 'Someone is on trial' });
					}
					break;
				case Phases.Lynching:
					votes = Votes.find({ }).fetch();
					playerVotes = { yes: 0, no: 0 };
					for (i = 0; i < votes.length; i++) {
						playerVotes[votes[i].value] = playerVotes[votes[i].value] + 1;
					}

					let lynch = Lynchs.find({ }).fetch()[0];
					let player = Players.find({ id: lynch.id }).fetch()[0];
					if (playerVotes.yes > playerVotes.no) {
						Players.update(player._id, { $set: { dead: true } });
						Lynchs.remove({ });
						ensureMafiaHasKillRole();
					}

					Lynchs.remove(lynch._id);
					Votes.remove({ });

					Voices.insert({
						content: player.name
							+ ' was found ' 
							+ (playerVotes.yes > playerVotes.no ? 'guilty' : 'innocent')
							+ ' with a vote of '
							+ playerVotes.yes
							+ ' to '
							+ playerVotes.no
					});
					Messages.insert({
						id: 'global',
						from: 'global',
						content: player.name
							+ ' was found ' 
							+ (playerVotes.yes > playerVotes.no ? 'guilty' : 'innocent')
							+ ' with a vote of '
							+ playerVotes.yes
							+ ' to '
							+ playerVotes.no
					});

					if (playerVotes.yes > playerVotes.no) {
						Voices.insert({
							content: 'their role was '
								+ player.role.name
						});
						Messages.insert({
							id: 'global',
							from: 'global',
							content: 'their role was '
								+ player.role.name
						});
					}

					if (Lynchs.find({ }).count() > 0) {
						return;
					}

					Voices.insert({ content: 'It is now night time' });
					Messages.insert({ id: 'global', from: 'global', content: 'It is now night time' });
					break;
				case Phases.Night:
					Voices.insert({ content: 'night is over.'});
					Messages.insert({ id: 'global', from: 'global', content: 'night is over.' });
					let actions = Actions.find({ }, { sort: [['priority', 'desc']] }).fetch();
					var action = actions.length > 0 ? actions[0] : null;
					while (action) {
						let player = Players.findOne({ id: action.id });
						let target = Players.findOne({ id: action.value });
						switch (action.type) {
							case Roles.Mafioso.name:
								simpleKillAction(action, player, target, 'the mafia');
								break;
							case Roles.Vigilante.name:
								simpleKillAction(action, player, target, 'a vigilante');
								break;
							case Roles.SerialKiller.name:
								simpleKillAction(action, player, target, 'a serial killer');
								break;
							case Roles.Doctor.name:
								Players.update(target._id, { $set: { isImmune: true } });
								Actions.insert({
									type: 'Remove Immunity',
									value: target.id,
									priority: -1
								});
								break;
							case Roles.Cop.name:
								if (target.role.alignment === Teams.Mafia) {
									Messages.insert({ id: player.id, from: 'you', content: target.name + ' is a member of the mafia!' });
								}
								else {
									Messages.insert({ id: player.id, from: 'you', content: target.name + ' is not suspicious.' });
								}
								break;
							case Roles.Lookout.name:
								var visitors = Actions.find({ value: action.value, id: { $ne: action.id } })
									.map((a) => Players.findOne({ id: a.id }).name);
								Messages.insert({ id: player.id, from: 'you', content: target.name + ' was visited by ' + visitors.join(', ') });
								break;
							case 'Remove Immunity':
								Players.update(target._id, { $set: { isImmune: target.role.isImmune || false } });
						}

						Actions.remove(action._id);
						actions = Actions.find({ }, { sort: [['priority', 'desc']] }).fetch();
						action = actions.length > 0 ? actions[0] : null;
					}					
					ensureMafiaHasKillRole();
					break;
			}

			Games.update(game._id, { $set: { state: nextPhase[game.state] } });

			checkGameOver();
		}
	})
});
