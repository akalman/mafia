import { Teams } from './teams.js';
import { Menus } from './menus.js';

export const Roles = {
	Villager: {
		name: 'Villager',
		alignment: Teams.Town
	},
	Mason: {
		name: 'Mason',
		chat: 'Mason',
		alignment: Teams.Town
	},
	Doctor: {
		name: 'Doctor',
		alignment: Teams.Town,
		menu: Menus.Unary,
		priority: 70,
		menuFilter: (player, session) => player.dead
	},
	Vigilante: {
		name: 'Vigilante',
		alignment: Teams.Town,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	Cop: {
		name: 'Cop',
		alignment: Teams.Town,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	Lookout: {
		name: 'Lookout',
		alignment: Teams.Town,
		menu: Menus.Unary,
		priority: 99,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	SerialKiller: {
		name: 'SerialKiller',
		alignment: Teams.SerialKiller,
		isImmune: true,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: (player, session) => player.dead || player.id === session.get('id')
	},
	MobGrunt: {
		name: 'MobGrunt',
		chat: Teams.Mafia,
		alignment: Teams.Mafia
	},
	Mafioso: {
		name: 'Mafioso',
		alignment: Teams.Mafia,
		chat: Teams.Mafia,
		menu: Menus.Unary,
		priority: 50,
		menuFilter: player => player.dead || player.role.alignment === Teams.Mafia
	}
};
