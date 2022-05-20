<script>
	import { fade } from 'svelte/transition';
	import { onMount, getContext } from 'svelte';
	import OrbFusionCard from './OrbFusionCard.svelte';
	import {
		craftingState,
		allAssetsStore,
		dataLoaded,
		activeUser,
		isDataLoading,
		now,
		waitingConfirmationCrafting
	} from 'src/stores/store';
	import { CRAFTING_STATE_INIT } from 'src/utils/constants';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import {
		CRAFTING_CONTRACT,
		TESTNET,
		TOKEN_CONTRACT,
		TRANSACTION_TIMEOUT_MS
	} from 'src/utils/config';
	import AwaitingAuth from 'src/components/flashdrive/AwaitingAuth.svelte';
	import CtaButton from 'src/components/CTAButton.svelte';
	import FusionSuccess from '../confirmation/FusionSuccess.svelte';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import { resolveAfterSeconds } from 'src/utils/helpers';
	import StartTimerLite from 'src/components/StartTimerLite.svelte';
	import OrbFusionSuccess from '../confirmation/OrbFusionSuccess.svelte';
	import { browser } from '$app/env';
	const { open, close } = getContext('simple-modal');
	let animDelayBase = 50;
	let innerWidth;
	let selectedRarity = null;
	let fusing = false;
	let fusionConfig;
	/* 	$: {
		if ($dataLoaded) {
			let gps = $allAssetsStore.filter((item) => item.schema.schema_name === 'greenprints');
			for (let i = 0; i < gps.length; i++) {
				if (i > 9) break;
				$craftingState.orbFusionCrafting[`slot${i + 1}`] = gps[i];
			}
			$craftingState.orbFusionCrafting.status = 0;
		}
	} */
	let numSlotsFilled = 0;
	$: {
		if ($dataLoaded) {
			for (let index = 0; index < 5; index++) {
				const element = $craftingState.orbFusionCrafting[`slot${index + 1}`];
				if (element && !selectedRarity) {
					selectedRarity = element.data.Rarity;
				}
			}
		}
	}
	$: slotsFilled =
		$craftingState.orbFusionCrafting.slot1 &&
		$craftingState.orbFusionCrafting.slot2 &&
		$craftingState.orbFusionCrafting.slot3 &&
		$craftingState.orbFusionCrafting.slot4 &&
		$craftingState.orbFusionCrafting.slot5;
	$: {
		if (
			!(
				$craftingState.orbFusionCrafting.slot1 ||
				$craftingState.orbFusionCrafting.slot2 ||
				$craftingState.orbFusionCrafting.slot3 ||
				$craftingState.orbFusionCrafting.slot4 ||
				$craftingState.orbFusionCrafting.slot5
			)
		)
			selectedRarity = null;
	}
	async function removeAll() {
		selectedRarity = null;
		$craftingState.orbFusionCrafting = JSON.parse(
			JSON.stringify(CRAFTING_STATE_INIT.orbFusionCrafting)
		);
		recalculateFilledSlots();
	}
	let shellCost = 0;
	var costs = {
		none: 0,
		Common: 0,
		Uncommon: 0,
		Epic: 0,
		Legendary: 0,
		Mythic: 0
	};
	async function recalculateFilledSlots() {
		numSlotsFilled = 0;
		for (let index = 0; index < 5; index++) {
			const element = $craftingState.orbFusionCrafting[`slot${index + 1}`];
			if (element) {
				numSlotsFilled++;
			}
		}
	}
	/* $: shellCost = costs[selectedRarity || 'none']; */
	async function addGp(assets) {
		for (let index = 0; index < assets.length; index++) {
			for (let index2 = 0; index2 < 5; index2++) {
				if (!$craftingState.orbFusionCrafting[`slot${index2 + 1}`]) {
					$craftingState.orbFusionCrafting[`slot${index2 + 1}`] = assets[index];
					break;
				}
			}
		}
		recalculateFilledSlots();
		shellCost = calculateFee(assets[0].data.Rarity);
	}
	let loading = false;
	let outcome;
	async function fuse() {
		loading = true;
		let fuseArray = [];
		for (let index = 0; index < 5; index++) {
			const element = $craftingState.orbFusionCrafting[`slot${index + 1}`];
			if (element) {
				fuseArray.push(element.asset_id);
			}
		}
		let actions = [
			{
				account: 'atomicassets',
				name: 'transfer',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: $activeUser.accountName,
					to: CRAFTING_CONTRACT,
					asset_ids: fuseArray,
					memo: 'orbfusion'
				}
			},
			{
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: $activeUser.accountName,
					to: CRAFTING_CONTRACT,
					quantity: shellCost.toFixed(4) + ' SHELL',
					memo: 'orbfusionfee'
				}
			},
			{
				account: CRAFTING_CONTRACT,
				name: 'orbfuse',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user: $activeUser.accountName
				}
			}
		];
		let transaction = { actions };
		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			setTimeout(async () => {
				const status = await waitForAttemptResult();
				outcome = status;
				open(
					OrbFusionSuccess,
					{ onClick: claim, craftLog: outcome },
					{
						styleContent: {
							padding: 0
						}
					}
				);
				getFusionStats();
				$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));
				loading = false;
			});
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			loading = false;
		}
	}
	let limits;
	async function getFusionStats() {
		const stats = await greenRabbitApi.fetchFusionStats($activeUser.accountName);
		if (stats) limits = stats;
		else {
			limits = {
				limit_start: 0,
				gp_fusions: 0,
				orb_fusions: 0,
				boost_counts: [
					{
						rarity: 'Common',
						count: 0
					},
					{
						rarity: 'Uncommon',
						count: 0
					},
					{
						rarity: 'Epic',
						count: 0
					},
					{
						rarity: 'Legendary',
						count: 0
					},
					{
						rarity: 'Mythic',
						count: 0
					}
				]
			};
		}
	}
	async function waitForAttemptResult() {
		let data = null;
		let craft;
		while (!data) {
			const craftLog = await greenRabbitApi.fetchFusionOutcome($activeUser.accountName, 'orb');
			if (craftLog?.outcome != 'pending') data = craftLog;
			await resolveAfterSeconds(1);
		}
		return data;
	}
	let remainingAttempts = 0;
	const MAX_DAILY_GP_FUSIONS = 2; // Temporary
	$: {
		if (limits) {
			if (limits.limit_start + 86400 > $now)
				remainingAttempts = TESTNET
					? 1000 - limits.orb_fusions
					: MAX_DAILY_GP_FUSIONS - limits.orb_fusions;
			else remainingAttempts = TESTNET ? 1000 : MAX_DAILY_GP_FUSIONS;
		}
	}

	onMount(async () => {
		const config = await greenRabbitApi.fetchFusionConfig();
		fusionConfig = config;

		getFusionStats();
		const craftLog = await greenRabbitApi.fetchFusionOutcome($activeUser.accountName, 'orb');

		if (craftLog) {
			open(
				OrbFusionSuccess,
				{ onClick: claim, craftLog },
				{
					styleContent: {
						padding: 0
					}
				}
			);
		}
	});
	function calculateFee(rarity) {
		const fees = fusionConfig.orb_fusion_fees;
		/* 	console.log('@boostConfig', boostingConfig); */
		for (let index = 0; index < fees.length; index++) {
			const element = fees[index];
			if (element.rarity === rarity) return Number(element.cost.split(' ')[0]);
		}
		return 0;
	}

	async function claim() {
		$waitingConfirmationCrafting = true;
		let actions = [
			{
				account: CRAFTING_CONTRACT,
				name: 'claimfusion',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					scope: 'orb',
					user: $activeUser.accountName
				}
			}
		];
		let transaction = { actions };
		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			setTimeout(async () => {
				window.refreshAssets(false, 2000, async () => {
					$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));
					loading = false;
					$waitingConfirmationCrafting = false;
					numSlotsFilled = 0;
					close();
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			loading = false;
			$waitingConfirmationCrafting = false;
			close();
		}
	}
	const fusionLineValues = {
		wide: [[212, 137, 1027, 137]],
		middle: [[130, 115, 510, 115]],
		small: [[85, 115, 242, 115]]
	};
</script>

<svelte:window bind:innerWidth />
<div class="wrapper">
	<div class="top">
		<div class="attempts">
			<span><b>Remaining attempts</b>: {remainingAttempts}</span>
			{#if limits && limits.limit_start + 86400 > $now}
				<div class="time-to-next">
					New Attempts: &nbsp; <StartTimerLite start={limits.limit_start + 86400} />
				</div>
			{/if}
		</div>
		<div class="grid">
			{#each Array(5) as _, i}
				<div in:fade={{ delay: animDelayBase * (i + 1) }}>
					<OrbFusionCard
						slot={`slot${i + 1}`}
						nftData={$craftingState.orbFusionCrafting[`slot${i + 1}`]}
						type="orbFusionCrafting"
						cardType="ASCENDANT ORB"
						filterType="artifacts"
						{addGp}
						{recalculateFilledSlots}
						rarity={selectedRarity}
						maxSelectCount={5 - numSlotsFilled}
					/>
				</div>
			{/each}
			<svg class="fusion-linebox" in:fade={{ delay: animDelayBase * 12 }}>
				{#each fusionLineValues[innerWidth > 1240 ? 'wide' : innerWidth > 768 ? 'middle' : 'small'] as lineValues}
					<line
						class:pulsating={slotsFilled}
						x1={lineValues[0]}
						y1={lineValues[1]}
						x2={lineValues[2]}
						y2={lineValues[3]}
						stroke="#36ffc0"
						stroke-width="2"
					/>
				{/each}
			</svg>
		</div>
		<div class="center">
			{#if !loading} <span class="fusion-remove" on:click={removeAll}>Remove all</span>{/if}
		</div>
		<div class="top-center-btns">
			<div class="c-flex">
				<img src="/icons/shell-icon.png" alt="" />
				<div>
					<p>Base Shellinium cost</p>
					<span>{toFixedCurrency(shellCost, 2)}</span>
				</div>
			</div>
			<div class="c-flex ml-30">
				<img src="/icons/success-rate.svg" alt="" />
				<div>
					<p>Success rate</p>
					<span>31%</span>
				</div>
			</div>
		</div>
		<div class="top-patterns">
			<div class="top-left" />
			<div class="top-right" />
		</div>
		<div class="bottom">
			<CtaButton
				fontSize="16px"
				onClick={fuse}
				text="Fuse Orbs"
				{loading}
				disabled={!slotsFilled || remainingAttempts == 0 || loading}
			/>
			<!-- 	<button on:click={fuse}> Fuse Greenprints </button> -->
			<hr />
		</div>
	</div>
</div>

<style>
	.top {
		background-color: #1c1c1c;
		padding: 26px 0px;
	}
	.wrapper {
		max-width: 325px;
		margin: 0 auto;
		position: relative;
	}
	.c-flex {
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}
	.ml-30 {
		margin-left: 30px;
	}
	.grid {
		margin: 10px auto 0;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, max-content));
		gap: 6px;
		justify-content: center;
		overflow-y: auto;
	}
	.fusion-linebox {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
	}
	.center {
		width: 100%;
		text-align: center;
		margin-bottom: 30px;
		margin-top: 20px;
	}
	.fusion-remove {
		font-size: 16px;
		color: var(--greenlight_cyan);
		cursor: pointer;
	}
	.fusion-remove:hover {
		color: #03b17a;
	}
	.bottom {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color: #2c2c2c;
		height: 140px;
	}
	.bottom button {
		width: 200px;
		border: 1px inset var(--greenlight_cyan);
		background-color: #44be98;
		text-transform: uppercase;
		padding: 10px;
		z-index: 1;
		color: white;
		font-weight: 600;
		font-size: 16px;
		cursor: pointer;
	}
	.bottom hr {
		margin-top: -20px;
		border: 1px solid #1c1c1c;
		width: 100%;
	}
	.top-center-btns {
		display: flex;
		justify-content: center;
		margin-bottom: -12px;
	}
	.top-center-btns img {
		height: 48px;
		width: auto;
		margin-right: 10px;
	}
	.top-center-btns p {
		color: white;
		font-weight: 600;
	}
	.top-center-btns span {
		color: var(--greenlight_cyan);
	}
	.top-patterns {
		width: 100%;
		display: flex;
		justify-content: center;
		height: 0;
		border-bottom: 2px solid #2cac84;
	}
	.time-to-next {
		display: flex;
		flex-direction: row;
	}
	.top-left {
		width: 240px;
		height: 25px;
		border-bottom: 2px solid #2cac84;
		border-left: 2px solid #2cac84;
		transform: skewX(45deg);
		background: #1c1c1c;
		margin-right: -20px;
	}
	.top-right {
		width: 240px;
		height: 25px;
		border-bottom: 2px solid #2cac84;
		border-right: 2px solid #2cac84;
		transform: skewX(-45deg);
		background: #1c1c1c;
		margin-left: -20px;
	}
	.attempts {
		padding: 0 25px;
		font-size: 15px;
		color: #ccc;
	}
	.attempts b {
		color: white;
	}
	@media (min-width: 768px) {
		.wrapper {
			max-width: 640px;
		}
		.grid {
			overflow: initial;
			gap: 10px;
			grid-template-columns: repeat(auto-fit, minmax(180px, max-content));
		}
	}
	@media (min-width: 1240px) {
		.wrapper {
			max-width: 1240px;
		}
		.grid {
			justify-content: center;
			padding: 20px 50px;
			gap: 24px;
		}
	}
	@media (max-width: 768px) {
		.top-center-btns img {
			height: 40px;
		}
		.top-center-btns p {
			font-size: 13px;
		}
		.top-left,
		.top-right {
			width: 165px;
			border-top: 2px solid #1c1c1c;
		}
		.ml-30 {
			margin-left: 10px;
		}
	}
</style>
