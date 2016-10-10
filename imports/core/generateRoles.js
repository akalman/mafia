import { Random } from 'meteor/random';

import { Roles } from '../types/roles.js';
import { Teams } from '../types/teams.js';

let townSpecials = [
	Roles.Doctor,
	Roles.Vigilante,
	Roles.Cop,
	Roles.Lookout
]

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

export function generateRoles(playerCount) {
	let roles = [];

	let difficulty = Random.fraction();
	let mafiaCount = playerCount * .25;
	let antiTownCount = playerCount * (.25 + difficulty * .08);

	if (antiTownCount - mafiaCount > .5) {
		roles.push(Roles.SerialKiller);
		antiTownCount--;
	}

	mafiaCount = (antiTownCount - mafiaCount > .5) ? Math.ceil(mafiaCount) : Math.floor(mafiaCount);
	roles.push(Roles.Mafioso);
	mafiaCount--;

	for (let i = 0; i < mafiaCount; i++) {
		roles.push(Roles.MobGrunt);
	}

	let townStrength = roles.length;
	while (townStrength > 0) {
		roles.push(Random.choice(townSpecials));
		townStrength--;
	}

	while (roles.length < playerCount) {
		roles.push(Roles.Villager);
	}

	return shuffle(roles);
}
