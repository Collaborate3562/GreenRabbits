<script>
	import GpCard from './GPCard.svelte';
	import CtaButton from 'src/components/CTAButton.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import Tooltip from '../overlays/Tooltip.svelte';
	import DesktopTooltip from '../overlays/DesktopTooltip.svelte';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import BoostingStatus from '../overlays/BoostingStatus.svelte';
	import { getContext, onMount } from 'svelte';
	const { open, close } = getContext('simple-modal');
	let opened = false;
	let status = 0;

	import {
		CRAFTING_STATE_INIT,
		TOOLTIP_SHELLINIUM,
		TOOLTIP_SHELLINIUM_BOOST,
		TOOLTIP_SUCCESS_RATE
	} from 'src/utils/constants';
	import {
		activeUser,
		allAssetsStore,
		craftingLog,
		craftingResult,
		craftingState,
		craftingStep,
		dataLoaded,
		now,
		waitingConfirmationCrafting
	} from 'src/stores/store';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import {
		CRAFTING_CONTRACT,
		TESTNET,
		TOKEN_CONTRACT,
		TRANSACTION_TIMEOUT_MS
	} from 'src/utils/config';
	import { resolveAfterSeconds } from 'src/utils/helpers';
	import BoostingCard from './BoostingCard.svelte';
	import NextAttemptTimer from 'src/components/NextAttemptTimer.svelte';
	let shelliniumCost = 0;
	let animDelayBase = 50;
	let successRate = 60;
	let innerWidth;
	let craftingInProgress = false;
	let craftingInAttempt = false;
	let selectedRarity = null;
	let fusing = false;
	/* 	$: {
		if ($dataLoaded) {
			let gps = $allAssetsStore.filter((item) => item.schema.schema_name === 'greenprints');
			for (let i = 0; i < gps.length; i++) {
				if (i > 9) break;
				$craftingState.fusionCrafting[`slot${i + 1}`] = gps[i];
			}
			$craftingState.fusionCrafting.status = 0;
		}
	} */
	let numSlotsFilled = 0;

	$: {
		if ($dataLoaded) {
			const element = $craftingState.boostingcrafting[`slot1`];
			const element2 = $craftingState.boostingcrafting[`slot2`];
			if (element && !selectedRarity) {
				selectedRarity = element.data.Rarity;
			} else if (element2 && !selectedRarity) {
				selectedRarity = element2.data.Rarity;
			}
		}
	}
	$: slotsFilled = $craftingState.boostingcrafting.slot1 && $craftingState.boostingcrafting.slot2;
	$: {
		if (!$craftingState.boostingcrafting.slot1 && !$craftingState.boostingcrafting.slot2)
			selectedRarity = null;
	}
	async function removeAll() {
		selectedRarity = null;
		$craftingState.boostingcrafting = JSON.parse(
			JSON.stringify(CRAFTING_STATE_INIT.boostingcrafting)
		);
	}
	let boostingConfig;
	onMount(async () => {
		const config = await greenRabbitApi.fetchFusionConfig();
		boostingConfig = config;
		getBoostingStats();
		const craftLog = await greenRabbitApi.fetchBoostOutcome($activeUser.accountName);
		const testUncommon = true;
		if (craftLog) {
			open(
				BoostingStatus,
				{
					craftLog,
					onClick: claim
				},
				{
					styleWindow: { width: craftLog.outcome != 'common' ? '1111px' : '800px' }
				}
			);

			/* 	styleWindow: { width: craftLog.outcome != 'common' ? '1100px' : '800px' }	open(
				FusionSuccess,
				{ onClick: claim, craftLog },
				{
					styleContent: {
						padding: 0
					}
				}
			); */
		}

		/* 	shelliniumCost = Number(calculateFee('Common').split(' ')[0]); */
	});
	function calculateFee(rarity) {
		const fees = boostingConfig.gp_boost_fees;
		/* 	console.log('@boostConfig', boostingConfig); */
		for (let index = 0; index < fees.length; index++) {
			const element = fees[index];
			if (element.rarity === rarity) return Number(element.cost.split(' ')[0]);
		}
		return 0;
	}
	let limits;
	async function getBoostingStats() {
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
	function openModal({ text, title }) {
		open(
			Tooltip,
			{ text, title },
			{
				styleWindow: {
					margin: '0',
					borderRight: 'none',
					borderLeft: 'none',
					borderBottom: 'none',
					height: '100%',
					width: '100%'
				},
				styleWindowWrap: {
					height: ' 400px',
					width: '100vw',
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					margin: 0,
					padding: 0
				}
			}
		);
	}

	async function addGp(asset, slot) {
		$craftingState.boostingcrafting[slot] = asset[0];
		if (slot == 'slot1') {
			shelliniumCost = calculateFee(asset[0].data.Rarity);
		}
	}
	async function waitForAttemptResult() {
		let data = null;
		let craft;

		while (!data) {
			const craftLog = await greenRabbitApi.fetchBoostOutcome($activeUser.accountName);

			if (craftLog?.outcome != 'pending') data = craftLog;

			await resolveAfterSeconds(1);
		}

		return data;
	}
	let maxAttempts = TESTNET ? 2 : 1;
	let remainingAttemptsCommon = maxAttempts;
	let remainingAttemptsUncommon = maxAttempts;
	let remainingAttemptsEpic = maxAttempts;
	let remainingAttemptsLegendary = maxAttempts;
	let remainingAttemptsMythic = maxAttempts;
	let noAttemptsLeft = null;
	let loading = false;
	let outcome;
	$: {
		if (limits) {
			if (limits.limit_start + 86400 > $now) {
				remainingAttemptsCommon = maxAttempts - limits.boost_counts[0].count;
				remainingAttemptsUncommon = maxAttempts - limits.boost_counts[1].count;
				remainingAttemptsEpic = maxAttempts - limits.boost_counts[2].count;
				remainingAttemptsLegendary = maxAttempts - limits.boost_counts[3].count;
				remainingAttemptsMythic = maxAttempts - limits.boost_counts[4].count;
			}
		}
	}

	$: {
		if (selectedRarity) {
			noAttemptsLeft = checkAttempts(selectedRarity);
		} else {
			noAttemptsLeft = null;
		}
	}

	function checkAttempts(selectedRarity) {
		if (selectedRarity == 'Common' && remainingAttemptsCommon > 0) return false;
		if (selectedRarity == 'Uncommon' && remainingAttemptsUncommon > 0) return false;
		if (selectedRarity == 'Epic' && remainingAttemptsEpic > 0) return false;
		if (selectedRarity == 'Legendary' && remainingAttemptsLegendary > 0) return false;
		if (selectedRarity == 'Mythic' && remainingAttemptsMythic > 0) return false;
		return true;
	}

	async function fuse() {
		loading = true;
		$waitingConfirmationCrafting = true;
		let boostArray = [];

		for (let index = 0; index < 2; index++) {
			const element = $craftingState.boostingcrafting[`slot${index + 1}`];
			if (element) {
				boostArray.push(element.asset_id);
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
					asset_ids: boostArray,
					memo: 'gpboost'
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
					quantity: shelliniumCost.toFixed(4) + ' SHELL',
					memo: 'gpboostfee'
				}
			},
			{
				account: CRAFTING_CONTRACT,
				name: 'gpboost',
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
					BoostingStatus,
					{ onClick: claim, craftLog: outcome },
					{
						styleWindow: { width: outcome.outcome != 'common' ? '1111px' : '800px' }
					}
				);
				getBoostingStats();
				$waitingConfirmationCrafting = false;
				$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));
				loading = false;
			});
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			loading = false;
			$waitingConfirmationCrafting = false;
		}
	}
	async function claim() {
		$waitingConfirmationCrafting = true;
		let actions = [
			{
				account: CRAFTING_CONTRACT,
				name: 'claimboost',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					scope: CRAFTING_CONTRACT,
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
					shelliniumCost = 0;
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
</script>

<div class="wrapper">
	<div
		class="greenLine"
		class:pulsating={$craftingState.boostingcrafting?.slot1 &&
			$craftingState.boostingcrafting?.slot2}
	/>
	<div class="attempts">
		<p>Remaining attempts:</p>
		<div class="grid-wrapper">
			<div class="attempt-rarity">
				<p class="rarity-grid">COMMON: <span>{remainingAttemptsCommon}</span></p>
				{#if remainingAttemptsCommon == 0}
					<span class="time-to-next"
						>New Attempt: <span><NextAttemptTimer end={Number(limits.limit_start + 86400)} /></span>
					</span>
				{/if}
			</div>
			<div class="attempt-rarity">
				<p class="rarity-grid">UNCOMMON: <span>{remainingAttemptsUncommon}</span></p>
				{#if remainingAttemptsUncommon == 0}
					<span class="time-to-next"
						>New Attempt: <span><NextAttemptTimer end={Number(limits.limit_start + 86400)} /></span>
					</span>
				{/if}
			</div>
			<div class="attempt-rarity">
				<p class="rarity-grid">EPIC: <span>{remainingAttemptsEpic}</span></p>
				{#if remainingAttemptsEpic == 0}
					<span class="time-to-next"
						>New Attempt: <span><NextAttemptTimer end={Number(limits.limit_start + 86400)} /></span>
					</span>
				{/if}
			</div>
			<div class="attempt-rarity">
				<p class="rarity-grid">LEGENDARY: <span>{remainingAttemptsLegendary}</span></p>
				{#if remainingAttemptsLegendary == 0}
					<span class="time-to-next"
						>New Attempt: <span><NextAttemptTimer end={Number(limits.limit_start + 86400)} /></span>
					</span>
				{/if}
			</div>
			<div class="attempt-rarity">
				<p class="rarity-grid">MYTHIC: <span>{remainingAttemptsMythic}</span></p>
				{#if remainingAttemptsMythic == 0}
					<span class="time-to-next"
						>New Attempt: <span><NextAttemptTimer end={Number(limits.limit_start + 86400)} /></span>
					</span>
				{/if}
			</div>
		</div>
	</div>
	<div class="top">
		<div class="grid">
			<div in:fade={{ delay: animDelayBase * 1 }}>
				<BoostingCard
					nftData={$craftingState.boostingcrafting?.slot1}
					type="boostingcrafting"
					slot="slot1"
					cardType="GREENPRINT"
					{addGp}
					filterType="greenprint"
					rarity={selectedRarity}
					boosting={true}
				/>
			</div>
			<div in:fade={{ delay: animDelayBase * 2 }}>
				<BoostingCard
					nftData={$craftingState.boostingcrafting?.slot2}
					type="boostingcrafting"
					slot="slot2"
					cardType="ASCENDANT ORB"
					{addGp}
					rarity={selectedRarity}
					filterType="artifacts"
					boosting={true}
				/>
			</div>
		</div>
	</div>

	<div class="bottom">
		<div class="infos">
			<div class="shell-cost">
				<img
					alt="Shell Processing Unit"
					src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629214217/GreenRabbit/shell-icon.png"
				/>
				<div class="inner">
					<p class="title">Base Shellinium Cost</p>
					<p class="value">
						{toFixedCurrency(shelliniumCost, 2) == '0.00'
							? '-'
							: toFixedCurrency(shelliniumCost, 2)}
					</p>
					<DesktopTooltip text={TOOLTIP_SHELLINIUM_BOOST}>
						<img
							on:click={() => openModal(TOOLTIP_SHELLINIUM_BOOST)}
							class="info-icon"
							alt="information"
							src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
						/>
					</DesktopTooltip>
				</div>
			</div>

			<!-- <div class="shell-success-rate">
				<img alt="success" src="./assets/Success_Rate-01.svg" />
				<div class="inner">
					<p class="title">Success rate</p>
					<p class="value">{successRate}%</p>

					<DesktopTooltip text={TOOLTIP_SUCCESS_RATE}>
						<img
							on:click={() => openModal(TOOLTIP_SUCCESS_RATE)}
							class="info-icon"
							alt="information"
							src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
						/>
					</DesktopTooltip>
				</div>
			</div> -->
		</div>

		<div class="shapeBg">
			<div class="greenLine" />
			<div class="stack-buttons">
				<CtaButton
					text={noAttemptsLeft == true ? 'NO ATTEMPTS LEFT' : 'BOOST GREENPRINT'}
					disabled={!(
						$craftingState.boostingcrafting?.slot1 && $craftingState.boostingcrafting?.slot2
					) ||
						$waitingConfirmationCrafting ||
						noAttemptsLeft == true}
					onClick={() => {
						fuse();
						/* 	open(BoostingStatus, { buildFailed: true }); */
					}}
					loading={$waitingConfirmationCrafting}
					width={innerWidth < 1240 ? '305px' : '215px'}
					height="45px"
					margin={innerWidth < 1240 ? '0 auto' : '0 0 0 auto'}
					fontSize="14px"
				/>
				<!-- <CtaButton
					text={$craftingStep == 1 ? 'FUSE GREENPRINTS' : 'BOOST CRAFTING'}
					disabled={!(
						$craftingState.boostingcrafting?.slot1 && $craftingState.boostingcrafting?.slot2
					) || $waitingConfirmationCrafting}
					onClick={() => {
						open(BoostingStatus, { buildCorrupted: true });
					}}
					loading={$waitingConfirmationCrafting}
					width={innerWidth < 1240 ? '305px' : '215px'}
					height="45px"
					margin={innerWidth < 1240 ? '0 auto' : '0 0 0 auto'}
					fontSize="14px"
				/>
				<CtaButton
					text={$craftingStep == 1 ? 'FUSE GREENPRINTS' : 'BOOST CRAFTING'}
					disabled={!(
						$craftingState.boostingcrafting?.slot1 && $craftingState.boostingcrafting?.slot2
					) || $waitingConfirmationCrafting}
					onClick={() => {
						open(BoostingStatus, { buildSucceded: true });
					}}
					loading={$waitingConfirmationCrafting}
					width={innerWidth < 1240 ? '305px' : '215px'}
					height="45px"
					margin={innerWidth < 1240 ? '0 auto' : '0 0 0 auto'}
					fontSize="14px"
				/> -->
			</div>
		</div>
	</div>
</div>

<style>
	.greenLine {
		width: 100%;
		height: 2px;
		position: absolute;
		top: 0;
		bottom: 77px;
		margin: auto 0;
		background-color: #36ffc0;
	}
	.shapeBg .greenLine {
		width: 100%;
		height: 2px;
		position: absolute;
		top: 30px;
		bottom: 0;
		margin: auto 0;
		background-color: #36ffc0;
	}
	/* 	.attempts {
		padding: 25px 0 0 25px;
	} */
	.attempts h3 {
		font-size: 19px;
		font-weight: 900;
	}
	.attempts > p {
		margin-bottom: 14px;
		font-weight: 900;
	}
	.attempts {
		padding: 0 18px;
		padding-top: 20px;
	}
	.grid-wrapper {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(127px, 127px));
		gap: 14px 35px;
		justify-content: center;
		padding: initial;
	}
	div.inner img.info-icon,
	div.shell-success-rate img.info-icon {
		width: 20px;
		height: 20px;
		position: absolute;
		top: 0;
		left: unset;
	}

	.shell-cost {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		margin-bottom: 26px;
	}
	.shell-success-rate {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		margin-bottom: 26px;
		margin-left: 60px;
	}

	.shell-success-rate img,
	.shell-cost img {
		width: 34px;
		height: 48px;
	}

	div.shell-spu div.inner img.info-icon {
		right: 0;
	}
	div.inner {
		margin-left: 15px;
		position: relative;
	}
	p.title {
		font-size: 17px;
		font-weight: 900;
	}
	p.value {
		font-size: 17px;
		font-weight: 600;
		color: var(--primary-teal);
	}

	.top,
	.bottom {
		background-color: #1c1c1c;
	}
	.top {
		padding: 26px 0px;
	}
	.bottom {
		margin: 0 auto 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: 22px 0 0 0;
	}
	.bottom .infos {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.bottom .infos div {
		margin-bottom: 0;
	}
	.bottom .shapeBg {
		position: relative;
		background: url('/boosting.png');
		width: 100%;
		height: 128px;
	}
	.buttom .shapeBg img {
		bottom: 0;
		width: 100%;
	}
	.attempt-rarity {
		line-height: 20px;
		width: 170px;
	}
	.bottom .shapeBg .stack-buttons {
		position: absolute;
		margin: auto;
		left: 0;
		right: 0;
		width: max-content;
		height: max-content;
		top: 30px;
		bottom: 0;
	}
	.time-to-next {
		font-size: 13px;
	}
	.wrapper {
		max-width: 325px;
		margin: 0 auto;
		background-color: #1c1c1c;
		position: relative;
	}

	.grid {
		margin: 28px auto 0;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, max-content));
		gap: 6px;
		justify-content: center;
		overflow-y: auto;
	}

	@media (min-width: 768px) {
		.wrapper {
			max-width: 640px;
		}

		.grid {
			overflow: initial;

			gap: 10px;
			grid-template-columns: repeat(auto-fit, minmax(235px, max-content));
		}
	}

	@media (min-width: 1240px) {
		.wrapper {
			max-width: 1240px;
		}
		.grid-wrapper {
			justify-content: flex-start;
			gap: 0 80px;
		}
		.attempts {
			padding: 0 30px;
			font-size: 19px;
			font-weight: 900;
			padding-top: 30px;
		}
		.grid {
			justify-content: center;
			margin-left: 30px;
			gap: 16px;
		}
	}

	@media (max-width: 1240px) {
		.bottom .shapeBg {
			background-position-x: 50%;
		}
	}
	@media (max-width: 768px) {
		.shell-cost img {
			width: 20px;
			height: 30px;
		}
		p.title,
		p.value {
			font-size: 12px;
		}
		.bottom .infos {
			flex-direction: column;
			align-items: flex-start;
		}
		.shell-success-rate {
			margin-left: 0;
		}
	}
</style>
