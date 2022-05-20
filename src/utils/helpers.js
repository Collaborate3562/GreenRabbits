import { MATS_CONTRACT, TOKEN_CONTRACT } from './config';

export const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const isStaked = (asset, stakedAssets) => {
	let c = 0;
	while (c < stakedAssets.length) {
		if (stakedAssets[c].asset_id === asset.asset_id) {
			return stakedAssets[c].drive_id;
		}
		c++;
	}
	return null;
};
export const isPromoStaked = (asset, stakedAssets) => {
	let c = 0;
	while (c < stakedAssets.length) {
		if (stakedAssets[c].asset_id === asset.asset_id) {
			return true;
		}
		c++;
	}
	return null;
};
export const isEmpty = (obj) => {
	return Object.keys(obj).length === 0;
};
export const zeroPad = (num, places) => String(num).padStart(places, '0');

export const convertHexToRGBA = (hexCode, opacity) => {
	let hex = hexCode.replace('#', '');

	if (hex.length === 3) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgba(${r},${g},${b},${opacity / 100})`;
};
export function resolveAfterSeconds(s) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, s * 1000);
	});
}

export function resolveAfterMS(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}
export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
const nameToTotem = {
	Cat: ['Cat Totem', 'Cat', 'Felicia'],
	Snake: ['Snake Totem', 'Snake', 'General Saw-Scale'],
	Turtle: ['Turtle Totem', 'Turtle', 'Mark Tortuga'],
	Rabbit: ['Rabbit Totem', 'Rabbit', 'Albert'],
	Wormhole: ['Wormhole'],
	Shellinium: ['Shellinium']
};

export function getTotemByName(name) {
	for (let totem of Object.keys(nameToTotem)) {
		let matches = nameToTotem[totem];
		for (let match of matches) {
			if (name.includes(match)) {
				return totem;
			}
		}
	}
	return '';
}

export function get_spu_fee(base_fee_percent, first_craft_amount, attempt_num) {
	let spu_fee = (first_craft_amount * base_fee_percent) / 100;

	// if second attempt, just return 5% fee
	if (attempt_num == 2) {
		return spu_fee;
	}

	// double fee for each attempt after second attempt
	for (let i = 3; i <= attempt_num; i++) {
		spu_fee = spu_fee * 2;
	}

	return spu_fee;
}
export function get_spu_fee_config(config, base_cost, attempt_num, rarity) {
	let multiplier = config.filter((e) => e.key == rarity)[0].value;
	if (attempt_num < 2) {
		return 0;
	}
	let spu_fee = base_cost * multiplier * (attempt_num - 1);

	// Divide by 100 due to amplified SPU multiplier ( 7% is represented as 7 * 100 )
	// to allow for decimals such as 7.55% etc
	spu_fee = spu_fee / 100;

	// Divide by 100 again to get percentage value
	spu_fee = spu_fee / 100;

	return spu_fee;
}

export function get_diff_hours_left(cooldown_time, current_epoch_secs) {
	const seconds_in_hour = 3600;
	const diff = cooldown_time - current_epoch_secs;

	// ceil the diff, so we only count fully elapsed hours
	const rounded_seconds = Math.ceil(diff / seconds_in_hour);

	const hours_between = rounded_seconds;

	return hours_between;
}

export function getCooldownData(nftData) {
	let cooldownAmount = Number(nftData.mutable_data['Status Type']) === 1 ? 12 : 24;

	let lastUsedUnixTs = new Date(Number(nftData.mutable_data['Last Used']) * 1000).getTime() / 1000;
	return (
		new Date(Number(nftData.mutable_data['Last Used']) * 1000).getTime() / 1000 +
		3600 * cooldownAmount
	);
}

// Helper for checking if a craft is empty or in progress
export function isCraftEmpty(craft) {
	if (!craft) {
		return true;
	}
	return (
		craft.asset_ids.length === 0 &&
		craft.aux_slot.length === 0 &&
		craft.boost_asset_ids.length === 0
	);
}

export function getFormattedCost(nftData, qty = 1) {
	let amt = Number(nftData.itemcost.split(' ')[0]);

	amt = amt * qty;

	return amt.toLocaleString(undefined, {
		// minimumFractionDigits: 4,
		maximumFractionDigits: 4
	});
}

export function getBoostData(nftData) {
	let bonusStat = 0;

	function boostString(stat) {
		const base = Number(nftData.baseStats[stat.toLowerCase()]);
		const real = Number(nftData.mutable_data[stat]);
		const boost = real - base;
		return { base, real, boost };
	}

	function calcBaseTotal() {
		return (
			Number(nftData.baseStats.agility) +
			Number(nftData.baseStats.intellect) +
			Number(nftData.baseStats.luck) +
			Number(nftData.baseStats.resilience) +
			Number(nftData.baseStats.speed) +
			Number(nftData.baseStats.strength)
		);
	}
	function calcRealTotal() {
		return (
			Number(nftData.mutable_data.Agility) +
			Number(nftData.mutable_data.Intellect) +
			Number(nftData.mutable_data.Luck) +
			Number(nftData.mutable_data.Resilience) +
			Number(nftData.mutable_data.Speed) +
			Number(nftData.mutable_data.Strength)
		);
	}

	if (nftData.schema.schema_name == 'greenprints') {
		bonusStat = (calcRealTotal() * 100) / calcBaseTotal() - 100;
		const stats = {
			strength: boostString('Strength'),
			resilience: boostString('Resilience'),
			agility: boostString('Agility'),
			speed: boostString('Speed'),
			intellect: boostString('Intellect'),
			luck: boostString('Luck'),
			total: bonusStat
		};
		return stats;
	}
}
export function dynamicSort(property) {
	var sortOrder = -1;
	if (property[0] === '-') {
		sortOrder = 1;
		property = property.substr(1);
	}
	return function (a, b) {
		var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
		return result * sortOrder;
	};
}
export function requiredExpToLevel(exp, lvl) {
	let required_exp = 100; // base exp required to level

	// lvl 1 - 9
	if (lvl > 0) {
		let max_effect = 8;
		let lvl_multi = Math.min(lvl - 1, max_effect);
		let increase_per_level = 75;
		required_exp = required_exp + increase_per_level * lvl_multi;
	}

	// lvl 10 - 24
	if (lvl >= 10) {
		let max_effect = 15;
		let lvl_multi = Math.min(lvl - 9, max_effect);
		let increase_per_level = 125;
		required_exp = required_exp + increase_per_level * lvl_multi;
	}

	// lvl 25 - 39
	if (lvl >= 25) {
		let max_effect = 15;
		let lvl_multi = Math.min(lvl - 24, max_effect);
		let increase_per_level = 225;
		required_exp = required_exp + increase_per_level * lvl_multi;
	}

	// lvl 40 - 49
	if (lvl >= 40) {
		let max_effect = 10;
		let increase_per_level = 250;
		let lvl_multi = Math.min(lvl - 39, max_effect);
		required_exp = required_exp + increase_per_level * lvl_multi;
	}

	return required_exp;
}

export function enoughExpToLevel(exp, lvl) {
	return exp >= requiredExpToLevel(exp, lvl);
}
export function getTotalExp(exp, lvl) {
	let total = 0;
	for (let index = 1; index < lvl; index++) {
		total += requiredExpToLevel(exp, index);
	}
	return total + Number(exp);
}
export function getMissionImg(name) {
	switch (name) {
		case 'Molten Mountains':
			return 'molten';
		case 'The Paragon Plains':
			return 'plains';
		case 'High Mountain Hillside':
			return 'mountains';
		case 'High Mountain Hillsides':
			return 'mountains';
		case 'The Forest of the Elders':
			return 'forest';
		case 'Garry & the Harvest King':
			return 'solstrus';
	}
}
export function getMissionRates(mission) {
	const outcomes = mission.outcomes;
	const outcome = outcomes.find((e) => {
		return e.key == 'mission outcome';
	});
	const chances = outcome.value;
	const total_odds = chances.total_odds / 10;
	const fail_rate =
		chances.chances.find((e) => {
			return e.key == 'fail';
		}).value / 10;
	const success_rate =
		chances.chances.find((e) => {
			return e.key == 'success';
		}).value / 10;

	return { total_odds, fail_rate, success_rate };
}
export function hoursDiff(cooldown_time, current_epoch_secs) {
	const seconds_in_hour = 3600;
	const diff = cooldown_time - current_epoch_secs;

	// ceil the diff, so we only count fully elapsed hours
	let rounded_seconds = Math.ceil(diff / seconds_in_hour);
	let hours_between = rounded_seconds;

	return hours_between;
}
export function getTransferAction(user, qty, memo, permission) {
	return {
		account: TOKEN_CONTRACT,
		name: 'transfer',
		authorization: [
			{
				actor: user,
				permission: permission
			}
		],
		data: {
			from: user,
			to: MATS_CONTRACT,
			quantity: qty,
			memo: memo
		}
	};
}

export function getInjuryChance(mission, character) {
	let foragerStrength =
		Number(character?.data['Base Strength']) + Number(character?.mutable_data?.Strength ?? 0);

	const {
		base_injury_chance,
		injury_chance_total_odds,
		max_injury_reduction_effect
	} = mission.current_weather;

	let injuredOdds = base_injury_chance - max_injury_reduction_effect * (foragerStrength / 50);

	return ((injuredOdds / injury_chance_total_odds) * 100).toLocaleString(undefined, {
		maximumFractionDigits: 1
	});
}

export function getLuckChance(mission, character) {
	const { bonus_chance, bonus_total_odds } = mission.materials[0];

	const forager_luck =
		Number(character?.data['Base Luck']) + Number(character?.mutable_data?.Luck ?? 0);

	const successRate = (bonus_chance * forager_luck) / 50;

	return ((successRate / bonus_total_odds) * 100).toLocaleString(undefined, {
		maximumFractionDigits: 1
	});
}

export function getMissionTier(mission) {
	if (mission?.type === 'Seasonal') {
		return 'S';
	}

	return mission.level_requirement == 10 ? 2 : mission.level_requirement == 25 ? 3 : 1;
}

export function getSaleImg(saleData) {
	let display_data = JSON.parse(saleData.display_data);

	// check sale "display_data" first
	if (display_data?.sale_img) {
		return display_data?.sale_img;
	}
	if (display_data?.img) {
		return display_data?.img;
	}

	// then check template immutable data
	if (!!saleData.templateData?.immutable_data?.img) {
		return saleData.templateData?.immutable_data?.img;
	}

	// TODO: Return some stock/placeholder image as default
	return '';
}
