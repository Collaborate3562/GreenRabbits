<script>
	import {
		allChars,
		characters,
		config,
		loading,
		materialBalances,
		missions,
		missionsActivated,
		missionSlots,
		orbs
	} from 'src/stores/missionStores';

	import { activeUser, loadingString, now } from 'src/stores/store';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import { chain } from 'src/utils/chain';
	import { MATS_CONTRACT } from 'src/utils/config';

	import { greenRabbitApi } from 'src/utils/green.rabbit.api';

	import { onMount } from 'svelte';

	function getAllChars(assets, slots, callback = () => {}, conf, unclaimed) {
		console.log('Get All Chars', assets, slots);
		let all = [];
		if (slots.length == 0) {
			$loading = false;
			return all;
		}
		$missionsActivated = true;

		for (let char of assets) {
			all.push(char);
		}
		for (let char2 of unclaimed) {
			all.push(char2.characterData);
		}

		for (let slot of slots) {
			if (slot.characterData) {
				const char = slot.characterData;

				char.onMission = true;
				char.missionDuration = slot.duration;
				char.missionStart = slot.start_time;
				char.missionEnd = slot.mission_end;
				char.missionId = slot.mission_id;

				all.push(char);
			}
		}

		for (let chr of all) {
			const level = Number(chr.data?.Level) || 1;
			const next_level = level + 1;

			const atCheckpoint = conf.checkpoints.find((checkpoint) => {
				return checkpoint.key == next_level;
			});
			chr.checkpoint = atCheckpoint || false;
		}
		$allChars = all;
		console.log('@allchars', all, conf);
		setTimeout(() => {
			$loading = false;
			callback();
		}, 500);
	}
	/* $: {
		if ($characters && $missionSlots) getAllChars($characters, $missionSlots);
	} */
	async function getConfig() {
		try {
			let res = await chain.post('/v1/chain/get_table_rows', {
				code: MATS_CONTRACT,
				scope: MATS_CONTRACT,
				table: 'config',
				limit: 1,
				json: true
			});

			console.log('@ config rows', res);

			let conf = res.rows[0];
			$config = conf;
		} catch (err) {
			console.log(err);
		}
	}

	async function getCharacters() {
		const charactersData = await greenRabbitApi.getCharacters($activeUser);
		$characters = charactersData;
		console.log('chars', $characters);
	}
	async function getMissionSlots(callback = () => {}) {
		const slotsData = await greenRabbitApi.getMissionSlots($activeUser);

		for (let index = 0; index < slotsData.length; index++) {
			const slot = slotsData[index];

			if (slot.characters.length) {
				for (let index2 = 0; index2 < slot.characters.length; index2++) {
					const char = slot.characters[index2];
					const charData = await atomicAssetsApi.getAssetsById([char]);
					slot.characterData = charData.data[0];
				}
			}
		}
		let conf;
		try {
			let res = await chain.post('/v1/chain/get_table_rows', {
				code: MATS_CONTRACT,
				scope: MATS_CONTRACT,
				table: 'config',
				limit: 1,
				json: true
			});

			console.log('@ config rows', res);

			conf = res.rows[0];
			$config = conf;
		} catch (err) {
			console.log(err);
		}
		let unclaimed = await chain.post('/v1/chain/get_table_rows', {
			code: MATS_CONTRACT,
			scope: MATS_CONTRACT,
			table: 'levelups',
			index_position: 2,
			key_type: 'name',
			limit: 100,
			lower_bound: $activeUser.accountName,
			upper_bound: $activeUser.accountName,
			json: true
		});
		for (let forager of unclaimed.rows) {
			const charData = await atomicAssetsApi.getAssetsById([forager.asset_id]);
			forager.characterData = charData.data[0];
			forager.characterData.unclaimed = true;
		}

		const charactersData = await greenRabbitApi.getCharacters($activeUser);
		$characters = charactersData;
		console.log('chars', $characters);
		$missionSlots = slotsData;
		getAllChars($characters, $missionSlots, callback, conf, unclaimed.rows);

		console.log('missionSlots', $missionSlots);
	}
	async function getMissions() {
		const missionsData = await greenRabbitApi.getMissions();
		$missions = missionsData;
		console.log('missionsData', $missions);
	}
	async function getMaterialBalances() {
		const materialsData = await greenRabbitApi.getMaterialBalances($activeUser);
		$materialBalances = materialsData;
		console.log('materialBalances', $materialBalances);
	}
	async function getOrbs() {
		const orbData = await greenRabbitApi.getOrbs($activeUser);
		$orbs = orbData;
		console.log('orbData', $orbs);
	}
	$: {
		if ($now) {
			for (let mission of $missions) {
				if (mission.next_weather_change <= $now) {
					greenRabbitApi.getMission(mission.id).then((data) => {
						mission = data;
					});
				}
			}
		}
	}
	async function load(callback = () => {}) {
		$loading = true;
		/* getCharacters(); */
		getMissionSlots(callback);
		getMissions();
		getMaterialBalances();
		getOrbs();
		getConfig();
	}
	onMount(async () => {
		load();
		window.reloadMissions = load;
		window.getCharacters = getCharacters;
		window.getMissionSlots = getMissionSlots;
		window.getMissions = getMissions;
		window.getMaterialBalances = getMaterialBalances;
		window.getOrbs = getOrbs;
	});
</script>

<slot />
