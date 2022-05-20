<script>
	import Rectangle_24 from '../../../static/assets/mission/Rectangle_24.png';
	import Rectangle_25 from '../../../static/assets/mission/Rectangle_25.png';
	import LevelUp from '../../../static/assets/mission/levelup.svg';
	import Rectangle_35 from '../../../static/assets/mission/Rectangle_35.png';
	import Rectangle_36 from '../../../static/assets/mission/Rectangle_36.png';
	import LevelBorder from '../../../static/assets/mission/levelborder.svg';
	import LevelUpBorder from '../../../static/assets/mission/levelupborder.svg';
	import Symbol from '../../../static/assets/mission/symbol.png';
	import Shape1 from '../../../static/assets/mission/Shape1.png';
	import Shape3 from '../../../static/assets/mission/Shape3.png';
	import Group_1565 from '../../../static/assets/mission/Group_1565.png';
	import Group_1490 from '../../../static/assets/mission/Group_1490.png';
	import Group_1521 from '../../../static/assets/mission/Group_1521.png';
	import mobileStatsBorder from '../../../static/assets/mission/stats-mobileborder.svg';
	import Vector_14 from '../../../static/assets/mission/Vector_14.png';
	import LevelProgressBar from './LevelProgressBar.svelte';
	import LevelIcon from '../icons/LevelIcon.svelte';
	import StatsProgressBar from './StatsProgressBar.svelte';
	import PlantsFloria from '../../../static/assets/mission/Plants_Floria.png';
	import PlantsNanore from '../../../static/assets/mission/Plants_Nanore.png';
	import PlantsSap from '../../../static/assets/mission/Plants_Sap.png';
	import PlantsVersatopium from '../../../static/assets/mission/Plants_Versatopium.png';
	import { activeUser, isDataLoading } from 'src/stores/store';
	import { MATS_CONTRACT } from 'src/utils/config';
	import { config, loading, materialBalances, selectedCharacter } from 'src/stores/missionStores';
	import { getTransferAction, resolveAfterMS } from 'src/utils/helpers';
	import { chain } from 'src/utils/chain';
	export let level;
	export let exp;
	export let character;
	export let expToLevel;
	export let totalExp;
	export let onLevelUp;

	export let statPoints;
	export let strength;
	export let speed;
	export let luck;

	export let onApplyStats;
	export let onResetStas;
	export let availableStats;
	export let hasStats;

	let tab = 'level';
	$: stats = {
		strength,
		luck,
		speed
	};
	let addedStats = {
		strength: 0,
		luck: 0,
		speed: 0
	};
	let maxStats = {
		strength: 50,
		luck: 50,
		speed: 50
	};

	$: {
		if (character) {
			addedStats = {
				strength: 0,
				luck: 0,
				speed: 0
			};
		}
	}
	function addStat(stat) {
		if (statPoints != 0 && addedStats[stat] + stats[stat] < maxStats[stat]) {
			statPoints--;
			addedStats[stat]++;
		}
	}
	function remStat(stat) {
		if (addedStats[stat] != 0) {
			statPoints++;
			addedStats[stat]--;
		}
	}
	let unclaimedLevelUp = false;

	async function assignSkillPoints() {
		/* const data = {
			strength: stats.strength + addedStats.strength,
			luck: stats.luck + addedStats.luck,
			speed: stats.speed + addedStats.speed
		}; */
		const data = addedStats;
		/* 		console.log('Forager', character);
		console.log('Skill point data', data); */

		const user = $activeUser?.accountName;

		let actions = [
			{
				account: MATS_CONTRACT,
				name: 'addattribpts',
				authorization: [
					{
						actor: user,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user: user,
					forager_id: character.asset_id,
					attrib_pts: data
				}
			}
		];

		let trx = {
			actions
		};

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});

			console.dir(result);
			$isDataLoading = true;
			$loading = true;

			open(AwaitingAuth);
			setTimeout(() => {
				window.reloadMissions(() => {
					$isDataLoading = false;
					$loading = false;
					close();
				});
			}, 4000);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	async function resetForagerAttributePoints() {
		const user = $activeUser?.accountName;

		let amount = $config.character_reset_fees.find((fee) => fee.key === character.data.Rarity)
			.value;

		let trx = {
			actions: [
				getTransferAction(
					user,
					amount,
					`forager attribute reset|${character.asset_id}`,
					$activeUser.requestPermission
				)
			]
		};

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});

			console.dir(result);
			close();
			open(AwaitingAuth);
			$isDataLoading = true;
			$loading = true;
			setTimeout(() => {
				window.refreshBalance();
				window.reloadMissions(() => {
					$isDataLoading = false;
					$loading = false;
					close();
				});
			}, 4000);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
	let stylingResetCD = {
		styleWindow: {
			height: '450px',
			width: '400px'
		},
		styleContent: {
			height: '100%',
			width: '100%'
		}
	};

	async function resetForagerAttributePointsModal() {
		let amount = $config.character_reset_fees.find((fee) => fee.key === character.data.Rarity)
			.value;

		open(
			ResetStats,
			{ amount: Number(amount.split(' ')[0]), onPay: resetForagerAttributePoints },
			stylingResetCD
		);
	}

	async function levelUpForager() {
		const user = $activeUser?.accountName;

		// let actions = [];

		let actions = [
			{
				account: 'atomicassets',
				name: 'transfer',
				authorization: [
					{
						actor: user,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: user,
					to: MATS_CONTRACT,
					asset_ids: [character.asset_id, selectedOrb.asset_id],
					memo: `forager levelup`
				}
			}
		];

		const level = Number(character.data.Level);
		const next_level = level + 1;

		const atCheckpoint = $config.checkpoints.find((checkpoint) => {
			return checkpoint.key == next_level;
		});

		// Add transfers on checkpoint levels
		if (atCheckpoint) {
			const { materials } = atCheckpoint.value;
			materials.forEach((material) => {
				actions.push(
					getTransferAction(
						user,
						material,
						`forager lvl up|${character.asset_id}`,
						$activeUser.requestPermission
					)
				);
			});
		}

		actions.push({
			account: MATS_CONTRACT,
			name: 'lvlup',
			authorization: [
				{
					actor: user,
					permission: $activeUser.requestPermission
				}
			],
			data: {
				user,
				forager_id: character.asset_id
			}
		});

		let trx = {
			actions
		};

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});
			$isDataLoading = true;
			$loading = true;
			open(AwaitingAuth);
			waitForLevelUpResult(character.asset_id);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	async function waitForLevelUpResult(forager_id) {
		let gotResult = false;

		let levelup;

		while (!gotResult) {
			await resolveAfterMS(2000);

			let res = await chain.post('/v1/chain/get_table_rows', {
				code: MATS_CONTRACT,
				scope: MATS_CONTRACT,
				table: 'levelups',
				limit: 1,
				lower_bound: forager_id,
				upper_bound: forager_id,
				json: true
			});

			levelup = res.rows[0];

			if (levelup.outcome != 'pending') {
				break;
			}
		}

		showLevelOutcome(levelup);
	}

	$: {
		if (character?.checkpoint) {
			calculateMaterials();
		}
	}
	let reqSap = 0;
	let reqNanore = 0;
	let reqVersat = 0;
	let reqFloria = 0;

	function calculateMaterials() {
		const level = Number(character.data.Level);
		const next_level = level + 1;

		const atCheckpoint = $config.checkpoints.find((checkpoint) => {
			return checkpoint.key == next_level;
		});

		// Add transfers on checkpoint levels
		if (atCheckpoint) {
			const { materials } = atCheckpoint.value;
			materials.forEach((material) => {
				const symbol = material.split(' ')[1];
				const value = material.split(' ')[0];

				switch (symbol) {
					case 'FLORIA':
						reqFloria = Number(value);
						break;
					case 'SAP':
						reqSap = Number(value);
						break;
					case 'VERSAT':
						reqVersat = Number(value);
						break;
					case 'NANORE':
						reqNanore = Number(value);
						break;
				}
			});
		}
	}
	function showLevelOutcome(result) {
		close();
		$loading = false;
		$isDataLoading = false;
		const currentlevel = Number(character.data.Level);
		const next_level = currentlevel + 1;
		open(LevelUpModal, {
			result,
			level: next_level,
			character,
			onClick: () => {
				claimLevelUp(character.asset_id);
			}
		});
	}

	async function claimLevelUp(asset_id) {
		const user = $activeUser.accountName;

		const actions = [
			{
				account: MATS_CONTRACT,
				name: 'claimlvlup',
				authorization: [
					{
						actor: user,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user,
					forager_id: asset_id
				}
			}
		];

		let trx = {
			actions
		};

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});

			console.dir(result);
			$isDataLoading = true;
			$loading = true;
			/* closeClaimLvlModal(); */
			close();
			open(AwaitingAuth);
			setTimeout(() => {
				window.refreshAssets();

				window.reloadMissions(() => {
					$isDataLoading = false;
					$loading = false;
					close();
				});
			}, 4000);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
	let selectedOrb = null;
	import { getContext, onMount } from 'svelte';
	import InventoryMaster from '../greenprint/overlays/InventoryMaster.svelte';
	import LevelUpModal from './LevelUpModal.svelte';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import ResetStats from '../greenprint/overlays/ResetStats.svelte';

	const { open, close } = getContext('simple-modal');
	const { openInventory } = getContext('notsimple-modal');
	let rarity = null;
	let innerWidth;
	$: border1 = innerWidth > 768 ? Rectangle_35 : LevelBorder;
</script>

<svelte:window bind:innerWidth />
{#if tab == 'level'}
	<div class="box-container">
		<img src={border1} alt="square plus" />
		<img src={Vector_14} class="line" alt="" />
		<div class="box-content">
			<div class="heading">
				<p class="box-title">LEVEL</p>
				<p class="box-title smaller">Total XP: <span class="points">{totalExp}</span></p>
			</div>

			<div class="box-info">
				<p class="exp-num">{exp} / {expToLevel} EXP</p>
				<div class="exp-img">
					<div class="bogbas">
						<LevelProgressBar percent={(exp * 100) / expToLevel} />
					</div>
					<LevelIcon {level} />
				</div>
				<button
					on:click={() => {
						tab = 'levelup';
					}}
					class="level-up"
					class:disabled={exp < expToLevel}>READY TO LEVEL UP</button
				>
			</div>
		</div>
	</div>
{:else if tab == 'levelup'}
	<div class="box-container">
		<img src={innerWidth > 768 ? LevelUp : LevelUpBorder} alt="square plus" />
		<img src={Vector_14} class="line" alt="" />
		<div class="box-content">
			<p class="box-title">LEVEL</p>
			<div class="box-info">
				<p class="exp-num">{exp} / {expToLevel} EXP</p>
				<div class="exp-img">
					<div class="bogbas">
						<LevelProgressBar percent={(exp * 100) / expToLevel} />
					</div>
					<LevelIcon {level} />
				</div>
				<div class="materials">
					<div class="orb w40 flex center">
						<div class="orb-box flex center">
							{#if selectedOrb}
								<img
									class="remove"
									on:click={() => {
										selectedOrb = null;
									}}
									src="/assets/mission/remove-btn.svg"
									alt=""
								/>
								<img
									style="min-width: 124px;"
									src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/{selectedOrb
										.data.img}.png"
									alt=""
								/>
							{:else}
								<span
									on:click={() => {
										openInventory(InventoryMaster, {
											filterType: 'artifacts',
											rarity,
											initialRarity: rarity,

											hasForm: true,
											onOkay: (e) => {
												selectedOrb = e[0];
												console.log(character);
												/* 	console.log('orb selected', e); */
											},
											inventoryType: 'artifacts',
											maxSelectCount: 1
										});
									}}>+</span
								>
							{/if}
						</div>
						{#if selectedOrb}
							<div class="rarity">{selectedOrb.data.Rarity}</div>
						{/if}
					</div>
					{#if character?.checkpoint}
						<div class="mats column  w60">
							<div class="left flex center column">
								<div class="menu-item m1">
									<img src={PlantsFloria} alt="PlantsFloria" class="menu-img" />
									<span class:insufficient={$materialBalances?.FLORIA < reqFloria}
										>{reqFloria}
									</span>
								</div>
								<div class="menu-item">
									<img src={PlantsSap} alt="PlantsSap" class="menu-img" />

									<span class:insufficient={$materialBalances?.SAP < reqSap}>{reqSap} </span>
								</div>
							</div>
							<div class="right  flex center column">
								<div class="menu-item m1">
									<img src={PlantsNanore} alt="PlantsNanore" class="menu-img" />
									<span class:insufficient={$materialBalances?.NANORE < reqNanore}
										>{reqNanore}
									</span>
								</div>
								<div class="menu-item">
									<img src={PlantsVersatopium} alt="PlantsVersatopium" class="menu-img" />
									<span class:insufficient={$materialBalances?.VERSAT < reqVersat}
										>{reqVersat}
									</span>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<button
					on:click={() => {
						if (unclaimedLevelUp) {
							alert('unclaimed lvl');
						} else {
							if (tab != 'levelup') tab = 'levelup';
							else if (selectedOrb) {
								if (!character?.checkpoint) levelUpForager();
								else if (
									$materialBalances?.VERSAT >= reqVersat &&
									$materialBalances?.NANORE >= reqNanore &&
									$materialBalances?.SAP >= reqSap &&
									$materialBalances?.FLORIA >= reqFloria &&
									level != 50
								)
									levelUpForager();
							}
						}
					}}
					class="level-up"
					class:level-up-first={innerWidth <= 768}
					class:disabled={level == 50 || tab != 'levelup'
						? exp < expToLevel
						: character?.checkpoint
						? !selectedOrb ||
						  $materialBalances?.VERSAT < reqVersat ||
						  $materialBalances?.NANORE < reqNanore ||
						  $materialBalances?.SAP < reqSap ||
						  $materialBalances?.FLORIA < reqFloria
						: !selectedOrb}>READY TO LEVEL UP</button
				>
			</div>
		</div>
	</div>
{/if}
<div class="box-container">
	<img src={innerWidth > 768 ? Rectangle_36 : mobileStatsBorder} alt="square plus" />
	<div class="line-box">
		<img src={Vector_14} alt="" />
		<img src={Vector_14} class="mt-40" alt="" />
		<img src={Vector_14} class="mt-40" alt="" />
		<img src={Vector_14} class="mt-40" alt="" />
	</div>
	<div class="box-content">
		<div class="stats-header">
			<p class="box-title">STATS</p>
			<p class="stats-point">
				Stat points:
				<span class="points">{statPoints}</span>
			</p>
		</div>
		<div class="box-info">
			<div class="stats-content strenght-box">
				<div class="line-title">
					<img src={Shape1} alt="strenght" class="icon-stats" />
					<p class="flex center">Strength</p>
				</div>
				<div class="strenght line-content">
					<StatsProgressBar
						max={maxStats.strength}
						current={stats.strength}
						added={addedStats.strength}
					/>
					<p class="score">
						{strength}
						<span class="added-points">{addedStats.strength ? '+' + addedStats.strength : ''}</span>
					</p>
					<button
						class="btn-add"
						style="margin-right:5px;"
						class:disabled={addedStats.strength == 0}
						on:click={() => {
							remStat('strength');
						}}>-</button
					>
					<button
						class="btn-add"
						class:disabled={statPoints == 0}
						on:click={() => {
							addStat('strength');
						}}>+</button
					>
				</div>
			</div>
			<div class="stats-content speed-box">
				<div class="line-title">
					<img src={Group_1565} alt="speed" class="icon-stats" />
					<p class="flex center">Speed</p>
				</div>
				<div class="speed line-content">
					<StatsProgressBar max={maxStats.speed} current={stats.speed} added={addedStats.speed} />
					<p class="score">
						{speed}
						<span class="added-points">{addedStats.speed ? '+' + addedStats.speed : ''}</span>
					</p>
					<button
						class="btn-add"
						style="margin-right:5px;"
						class:disabled={addedStats.speed == 0}
						on:click={() => {
							remStat('speed');
						}}>-</button
					>
					<button
						class="btn-add"
						class:disabled={statPoints == 0}
						on:click={() => {
							addStat('speed');
						}}>+</button
					>
				</div>
			</div>
			<div class="stats-content luck-box">
				<div class="line-title">
					<img src={Shape3} alt="luck" class="icon-stats" />
					<p class="flex center">Luck</p>
				</div>
				<div class="luck line-content">
					<StatsProgressBar max={maxStats.luck} current={stats.luck} added={addedStats.luck} />
					<p class="score">
						{luck} <span class="added-points">{addedStats.luck ? '+' + addedStats.luck : ''}</span>
					</p>
					<button
						class="btn-add"
						style="margin-right:5px;"
						class:disabled={addedStats.luck == 0}
						on:click={() => {
							remStat('luck');
						}}>-</button
					>
					<button
						on:click={() => {
							addStat('luck');
						}}
						class="btn-add"
						class:disabled={statPoints == 0}>+</button
					>
				</div>
			</div>
			<div>
				<button
					class:disabled={!(addedStats.strength || addedStats.luck || addedStats.speed)}
					class="level-up apply-btn"
					on:click={assignSkillPoints}>APPLY</button
				>
			</div>
			<button
				class="btn-reset"
				class:disabled={!hasStats}
				on:click={resetForagerAttributePointsModal}>Reset all stats</button
			>
		</div>
	</div>
</div>

<style>
	.smaller {
		font-size: 16px;
	}

	.points {
		color: var(--primary-teal);
	}
	.heading {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}
	.insufficient {
		color: red !important;
	}
	.rarity {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 4px 12px;

		width: 90px;
		height: 28px;
		font-family: Lato;
		font-style: normal;
		font-weight: bold;
		font-size: 14px;
		line-height: 20px;
		background: #000000;
		border: 1px solid #ffffff;
		box-sizing: border-box;
		border-radius: 300px;
		position: absolute;
		margin-top: 100px;
	}
	.orb-box {
		width: 112px;
		height: 112px;

		background: linear-gradient(180deg, #16161682 0%, #1e1e1e82 100%);

		border: 1px solid #8f8f8f;
		box-sizing: border-box;
		border-radius: 100px;
		overflow: hidden;
	}
	.orb-box .remove {
		position: absolute;
		margin-top: -100px;
		margin-left: 69px;
	}
	.orb-box span {
		font-size: 45px;
	}

	.m1 {
		margin-bottom: 16px;
	}
	.menu-img {
		max-width: 35px;
	}
	.menu-item {
		/* 	width: 25%;
		justify-content: space-around; */
		display: flex;
		align-items: center;
	}

	.menu-item span {
		font-family: Lato;
		font-style: normal;
		font-weight: bold;
		font-size: 16px;
		line-height: 19px;
		display: flex;
		align-items: center;
		text-align: center;

		color: #ffffff;
		justify-content: center;
		margin-left: 6px;
		width: 66px;
		height: 34px;

		background: #000000;
		border-radius: 2px;
	}
	.column {
		flex-direction: column;
	}
	.row {
		flex-direction: row;
	}
	.materials {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: -38px;
		margin-right: -43px;
	}
	.mats {
		display: flex;
		flex-direction: row;
	}
	.left {
		width: 50%;
	}
	.right {
		width: 50%;
	}
	.column1 {
		width: 50%;
	}
	.materials {
		min-height: 192px;
		background: linear-gradient(180deg, #000000bf 0%, #0d0d0dbf 100%);
	}
	.disabled {
		opacity: 0.3;
		cursor: default !important;
		pointer-events: none;
	}
	.added-points {
		color: #20906d;
	}
	.icon-stats {
		object-fit: scale-down;
	}
	.box-container {
		position: relative;
	}
	.box-title {
		font-size: 20px;
		line-height: 48px;
		font-weight: 900;
	}
	.box-content {
		position: absolute;
		top: 50px;
		left: 70px;
		width: 493px;
	}
	.box-info {
		text-align: center;
		display: block;
		margin-top: 20px;
	}
	.exp-num {
		font-size: 18px;
		font-weight: 700;
		position: absolute;
		left: 45%;
	}
	.exp-img {
		display: flex;
		align-items: center;
		position: relative;
	}
	.stats-content {
		display: flex;
		margin-bottom: 22px;
		justify-content: space-between;
	}
	.line-title {
		display: flex;
		width: 10%;
	}
	.line-title p {
		margin-left: 15px;
	}
	.score {
		display: flex;
		margin-right: 0px;
		width: 10%;
		margin-left: 16px;
	}
	.btn-add {
		font-size: 30px;
		font-weight: 900;
		cursor: pointer;
		background: linear-gradient(90deg, #44be98 2.6%, #20906d 84.4%);
		border: 1px solid #36ffc0;
		box-sizing: border-box;
		border-radius: 4px;
		color: #ffffff;
		padding: 5px;
		line-height: 20px;
		width: 36px;
		height: 36px;
	}
	.bogbas {
		margin-top: -21px;
		position: absolute;
		margin-left: 63px;
	}
	.bogbas-width {
		position: absolute;
		top: 41%;
	}
	.bogbas-sub {
		position: relative;
		margin: 0 15px;
	}
	.bogbas-width-sub {
		position: absolute;
		top: 0;
	}

	.level-up {
		padding: 13px 20px;
		font-size: 16px;
		font-weight: 900;
		font-family: Lato;
		color: #ffffff;
		margin-top: 30px;
		cursor: pointer;
		background: linear-gradient(90deg, #44be98 2.6%, #20906d 84.4%);
	}
	.apply-btn {
		border-radius: 4px;
	}
	.line {
		position: absolute;
		bottom: 110px;
		left: 30px;
	}
	.line-content {
		display: flex;
		align-items: center;
		width: 80%;
	}
	.line-box {
		position: absolute;
		top: 100px;
		left: 30px;
	}
	.stats-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.mt-40 {
		margin-top: 60px;
	}
	.btn-reset {
		background-color: transparent;
		color: #36ffc0;
		font-size: 20px;
		margin-top: 30px;
		cursor: pointer;
	}
	.btn-reset:hover {
		color: #d8f5ec;
	}
	@media (max-width: 768px) {
		.box-content {
			left: 38px;
			width: 287px;
		}
		.materials {
			min-height: 510px;
			flex-direction: column;
			margin-left: -22px;
			margin-right: -19px;
		}
		.orb {
			margin-bottom: 87px;
		}
		.menu-item {
			min-height: 50px;
		}
		.line {
			left: 16px;
		}
		.level-up {
			margin-top: 53px;
		}
		.level-up-first {
			margin-top: 30px !important;
		}
		.score {
			margin-right: 13px;
			width: 19%;
		}
		.stats-content {
			flex-direction: column;
			margin-bottom: 2px;
		}
		.line-content {
			width: 100%;
		}
		.btn-add {
			width: 30px;
			height: 30px;
		}
		.btn-reset {
			margin-top: 12px;
		}
		.box-info {
			margin-top: 3px;
		}
	}
</style>
