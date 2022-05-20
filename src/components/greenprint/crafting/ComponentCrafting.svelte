<script>
	import GpCard from './GPCard.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import CtaButton from 'src/components/CTAButton.svelte';
	import { afterUpdate, getContext, onMount } from 'svelte';
	import Tooltip from '../overlays/Tooltip.svelte';
	const { open, close } = getContext('simple-modal');
	const { openInventory, closeInventory } = getContext('notsimple-modal');
	import {
		TOOLTIP_FAILURE_RATE,
		TOOLTIP_SHELLINIUM,
		TOOLTIP_POWER_COST,
		CRAFTING_STATE_INIT
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
	import { CRAFTING_CONTRACT, TOKEN_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import DesktopTooltip from '../overlays/DesktopTooltip.svelte';

	import AwaitingAuth from 'src/components/flashdrive/AwaitingAuth.svelte';
	import CraftingStatus from '../overlays/CraftingStatus.svelte';
	import {
		get_spu_fee,
		resolveAfterSeconds,
		isCraftEmpty,
		resolveAfterMS,
		get_spu_fee_config,
		dynamicSort
	} from 'src/utils/helpers';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import InventoryMaster from '../overlays/InventoryMaster.svelte';
	import NextAttemptTimer from 'src/components/NextAttemptTimer.svelte';
	import ResetIcon from 'src/components/misc/ResetIcon.svelte';

	import { browser } from '$app/env';

	const TWENT_FOUR_HOURS_IN_SECONDS = 60 * 60 * 24;
	const FIGURE_SECOND_ATTEMPT_FAIL_CHANCE = 15;
	const FIGURE_ADDITIONAL_ATTEMPT_FAIL_CHANCE = 10; // attempts 3+
	const COMPONENT_FAIL_CHANCE_PER_ATTEMPT = 15;
	const BASE_FAILURE_RATE = 40; // 40%
	const BASE_SPU_FEE_PERCENT = 5; // 5%

	let craftingInAttempt = false;
	let craftingInProgress = false;
	let craftFeePaid = false;
	let spuFeePaid = false;
	let stylingCraftStatus;

	let craftingConfig;
	let attempt_chances;
	$: {
		if ($now && craftingConfig) {
			attempt_chances = getAttemptChances();
		}
	}
	onMount(async () => {
		if (browser) {
			if (!craftingConfig) {
				craftingConfig = await greenRabbitApi.fetchCraftingConfig();
				attempt_chances = getAttemptChances();
				maxAttempts = getMaxAttempts();
			}
		}

		innerWidth = window.innerWidth;
		stylingCraftStatus =
			innerWidth < 830
				? {
						styleWindow: {
							margin: '0',
							borderRight: 'none',
							borderLeft: 'none',
							borderBottom: 'none',
							height: '100%',
							width: '100vw',
							display: 'flex'
						},
						styleWindowWrap: {
							height: ' 100vh',
							width: '100vw',
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							margin: 0,
							padding: 0
						},
						styleContent: {
							height: '100%',
							width: '100%',
							paddingRight: 0,
							paddingLeft: 0,
							paddingTop: 0
						}
				  }
				: {
						styleWindowWrap: { height: '550px', width: '830px', margin: '0 auto' },
						styleWindow: { height: '550px', width: '830px' },
						styleContent: {
							height: '100%',
							width: '100%',
							paddingBottom: '0',
							paddingRight: '0',
							paddingLeft: '0',
							paddingTop: '0'
						}
				  };
	});

	afterUpdate(() => {
		stylingCraftStatus =
			innerWidth < 830
				? {
						styleWindow: {
							margin: '0',
							borderRight: 'none',
							borderLeft: 'none',
							borderBottom: 'none',
							height: '100%',
							width: '100vw',
							display: 'flex'
						},
						styleWindowWrap: {
							height: ' 100vh',
							width: '100vw',
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							margin: 0,
							padding: 0
						},
						styleContent: {
							maxHeight: '100vh!important',

							height: '100%',
							width: '100%',
							paddingRight: 0,
							paddingLeft: 0,
							paddingTop: 0
						}
				  }
				: {
						styleWindowWrap: { height: '550px', width: '830px', margin: '0 auto' },
						styleWindow: { height: '550px', width: '830px' },
						styleContent: {
							height: '100%',
							width: '100%',
							paddingBottom: '0',
							paddingRight: '0',
							paddingLeft: '0',
							paddingTop: '0'
						}
				  };
	});

	$: {
		if ($craftingLog && $dataLoaded && !craftingInProgress) {
			if (
				$craftingLog.current_craft.asset_ids.length == 4 &&
				!$craftingState.fourcomponent.status
			) {
				$craftingState.fourcomponent.slot1 = $allAssetsStore.filter(
					(item) => item.asset_id == $craftingLog.current_craft.asset_ids[0]
				)[0];
				$craftingState.fourcomponent.slot2 = $allAssetsStore.filter(
					(item) => item.asset_id == $craftingLog.current_craft.asset_ids[1]
				)[0];
				$craftingState.fourcomponent.slot3 = $allAssetsStore.filter(
					(item) => item.asset_id == $craftingLog.current_craft.asset_ids[2]
				)[0];
				$craftingState.fourcomponent.slot4 = $allAssetsStore.filter(
					(item) => item.asset_id == $craftingLog.current_craft.asset_ids[3]
				)[0];

				if ($craftingLog.current_craft.aux_slot.length) {
					atomicAssetsApi.getAssetsById($craftingLog.current_craft.aux_slot).then((res) => {
						$craftingState.fourcomponent.aux = res.data[0];
						$craftingStep = 3;
						showAux = true;
						craftingInAttempt = true;
						$craftingState.fourcomponent.status = 1;
					});
				} else {
					$craftingStep = 2;
					craftingInAttempt = true;
					$craftingState.fourcomponent.status = 1;
				}

				if (
					($craftingLog.current_craft.craft_fee_paid ||
						$craftingLog.current_craft.aux_slot.length) &&
					($craftingLog.current_craft.spu_fee_paid ||
						$craftingLog.current_craft.spu_fee == '0.0000 SHELL')
				) {
					$craftingStep = 3;

					if ($craftingLog.current_craft.crafted) {
						const asset_id = $craftingLog.current_craft.outcome;

						greenRabbitApi.fetchCraftOutcome(asset_id).then((template_data) => {
							$craftingResult = template_data[0];

							$craftingStep = 4;
							open(CraftingStatus, { buildFailed: false, claimClick }, stylingCraftStatus);
						});
					}
				}
			}
		}
	}

	let showAux = false;
	let auxSelected = false;
	let auxName = 'Greenprint Shellinium Credit';
	let innerWidth;
	let data = true;

	const claimClick = () => {
		$waitingConfirmationCrafting = true;
		handleClaim();
	};

	const abandonCraft = async () => {
		let actions = [
			{
				account: CRAFTING_CONTRACT,
				name: 'abandoncraft',
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

		close();
		open(AwaitingAuth);

		let transaction = { actions };
		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});

			setTimeout(async () => {
				window.refreshCraftLogs(false, 2000, () => {
					$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));
					$craftingStep = 1;
					close();
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			window.refreshCraftLogs(false, 2000, () => {});
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	};

	async function waitForAttemptResult() {
		let data = null;
		let craft;

		while (!data) {
			const craftLog = await greenRabbitApi.fetchCraftLog($activeUser);

			if (craftLog.current_craft.asset_ids.length == 0) data = 'failed';
			if (craftLog.current_craft.crafted) data = 'success';

			craft = craftLog;

			await resolveAfterSeconds(1);
		}

		if (data == 'success') {
			const asset_id = craft.current_craft.outcome;
			const template_data = await greenRabbitApi.fetchCraftOutcome(asset_id);

			$craftingLog = craft;
			$craftingResult = template_data[0];
		}

		return data;
	}
	async function handleClaim() {
		let actions = [
			{
				account: CRAFTING_CONTRACT,
				name: 'claim',
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

			setTimeout(() => {
				window.refreshCraftLogs(false, 2000, () => {
					close();
					$craftingStep = 1;

					$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));
					$waitingConfirmationCrafting = false;
				});
				window.refreshAssets(false, 1);
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			$waitingConfirmationCrafting = false;
			window.refreshCraftLogs(false, 2000, () => {});
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	async function handleCompleteCraft() {
		const user = $activeUser.accountName;
		const permission = $activeUser.requestPermission;
		const authorization = [{ actor: user, permission }];

		let craft = await greenRabbitApi.fetchCraftLog($activeUser);
		let curr_craft = craft.current_craft;

		let actions = [];

		// If Aux Slot isn't empty, add the credit transfer
		if (curr_craft.aux_slot.length > 0) {
			// Don't pay craft fee
		} else if (!curr_craft.craft_fee_paid) {
			// Craft Fee action if no Credit added
			actions.push({
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization,
				data: {
					from: user,
					to: CRAFTING_CONTRACT,
					quantity: curr_craft.craft_fee,
					memo: 'craftfee'
				}
			});
		}

		// Add SPU Fee action if needed
		if (curr_craft.spu_fee != '0.0000 SHELL' && !curr_craft.spu_fee_paid) {
			actions.push({
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization,
				data: {
					from: user,
					to: CRAFTING_CONTRACT,
					quantity: curr_craft.spu_fee,
					memo: 'spufee'
				}
			});
		}

		// Call Attempt
		actions.push({
			account: CRAFTING_CONTRACT,
			name: 'attempt',
			authorization,
			data: { user }
		});

		let success = await pushCraftActions(actions);
		if (!success) return;

		handleAwaitResult();
	}

	async function handleOneClickCraft() {
		const user = $activeUser.accountName;
		const permission = $activeUser.requestPermission;
		const authorization = [{ actor: user, permission }];

		const craftFee = `${shelliniumCost.toFixed(4)} SHELL`;

		// Default Craft Action thats always needed
		let actions = [
			{
				account: CRAFTING_CONTRACT,
				name: 'craft',
				authorization,
				data: {
					user,
					asset_ids: [
						$craftingState.fourcomponent.slot1.asset_id,
						$craftingState.fourcomponent.slot2.asset_id,
						$craftingState.fourcomponent.slot3.asset_id,
						$craftingState.fourcomponent.slot4.asset_id
					]
				}
			}
		];

		// If Aux Slot isn't empty, add the credit transfer
		if ($craftingState.fourcomponent.aux) {
			actions.push({
				account: 'atomicassets',
				name: 'transfer',
				authorization,
				data: {
					from: user,
					to: CRAFTING_CONTRACT,
					asset_ids: [$craftingState.fourcomponent.aux.asset_id],
					memo: 'addcredit'
				}
			});
		} else {
			// Craft Fee action if no Credit added
			actions.push({
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization,
				data: {
					from: user,
					to: CRAFTING_CONTRACT,
					quantity: craftFee,
					memo: 'craftfee'
				}
			});
		}

		// Add SPU Fee action if needed
		if (spuFee > 0) {
			const spuFeeAsset = `${spuFee.toFixed(4)} SHELL`;
			actions.push({
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization,
				data: {
					from: user,
					to: CRAFTING_CONTRACT,
					quantity: spuFeeAsset,
					memo: 'spufee'
				}
			});
		}

		// Call Attempt
		actions.push({
			account: CRAFTING_CONTRACT,
			name: 'attempt',
			authorization,
			data: { user }
		});

		let success = await pushCraftActions(actions);
		if (!success) return;

		handleAwaitResult();
	}

	async function pushCraftActions(actions) {
		$waitingConfirmationCrafting = true;

		let transaction = { actions };

		try {
			await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			return true;
		} catch (err) {
			console.log(err);
			$waitingConfirmationCrafting = false;
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			return false;
		}
	}

	async function handleAwaitResult() {
		await resolveAfterMS(5000);

		let craftResult = await waitForAttemptResult();

		$waitingConfirmationCrafting = false;

		let opts = {};

		if (craftResult == 'success') {
			$craftingStep = 4;
			opts = { buildFailed: false, claimClick };
		} else {
			$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));

			window.refreshAssets(false, 1);
			window.refreshCraftLogs(false, 2000, () => {});

			opts = {
				buildFailed: true,
				claimClick: () => {
					$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));

					$waitingConfirmationCrafting = false;
					$craftingStep = 1;
					close();
				}
			};
		}

		open(CraftingStatus, opts, stylingCraftStatus);
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

	function getCost(asset) {
		if (!craftingConfig) return 0;
		const config = craftingConfig.four_component_base_costs.filter(
			(e) => e.key == asset.data.Rarity
		)[0];

		return config.value;
	}
	let shelliniumCost = 0;
	$: {
		if ($craftingState && craftingConfig) {
			let shellCostTemp = 0;
			if ($craftingState.fourcomponent.slot1)
				shellCostTemp += getCost($craftingState.fourcomponent.slot1);
			if ($craftingState.fourcomponent.slot2)
				shellCostTemp += getCost($craftingState.fourcomponent.slot2);
			if ($craftingState.fourcomponent.slot3)
				shellCostTemp += getCost($craftingState.fourcomponent.slot3);
			if ($craftingState.fourcomponent.slot4)
				shellCostTemp += getCost($craftingState.fourcomponent.slot4);
			shelliniumCost = shellCostTemp / 10000;
		}
	}

	function calculate_spu_fee(firstCraftCost, attemptNo) {
		let spu_fee = 0;
		if ($craftingState.fourcomponent.slot1 && craftingConfig)
			spu_fee += get_spu_fee_config(
				craftingConfig.four_component_spu_multipliers,
				getCost($craftingState.fourcomponent.slot1) / 10000,
				attemptNo,
				$craftingState.fourcomponent.slot1.data.Rarity
			);
		if ($craftingState.fourcomponent.slot2)
			spu_fee += get_spu_fee_config(
				craftingConfig.four_component_spu_multipliers,
				getCost($craftingState.fourcomponent.slot2) / 10000,
				attemptNo,
				$craftingState.fourcomponent.slot2.data.Rarity
			);
		if ($craftingState.fourcomponent.slot3)
			spu_fee += get_spu_fee_config(
				craftingConfig.four_component_spu_multipliers,
				getCost($craftingState.fourcomponent.slot3) / 10000,
				attemptNo,
				$craftingState.fourcomponent.slot3.data.Rarity
			);
		if ($craftingState.fourcomponent.slot4)
			spu_fee += get_spu_fee_config(
				craftingConfig.four_component_spu_multipliers,
				getCost($craftingState.fourcomponent.slot4) / 10000,
				attemptNo,
				$craftingState.fourcomponent.slot4.data.Rarity
			);
		return spu_fee;
	}
	function handleUpdateCraftValues($craftingLog) {
		// handle new users with no craft log
		if (!$craftingLog) {
			failureRate = 40; // default fail rate of 40%
			spuFee = 0;
			return;
		}

		const newWindowTime = $craftingLog.first_craft + TWENT_FOUR_HOURS_IN_SECONDS;
		const insideNewCraftWindow = newWindowTime < $now;
		const attemptNo = getCurrentAttemptNum($craftingLog.current_craft, $craftingLog.totals);
		const firstCraftCost = getFirstCraftCost($craftingLog.totals);

		// handle SPU fee calc
		if (!insideNewCraftWindow) {
			spuFee = calculate_spu_fee(firstCraftCost, attemptNo);
		}

		// handle calc craft fail rate
		failureRate = getFailRate(attemptNo, insideNewCraftWindow);
	}

	let failureRate = 0;
	let spuFee = 0;
	$: {
		if ($now) {
			handleUpdateCraftValues($craftingLog);
		}
	}

	// function calcFailrate() {
	// 	if ($craftingStep !== 4) {
	// 		return $craftingLog.totals.component_crafts * COMPONENT_FAIL_CHANCE_PER_ATTEMPT;
	// 	} else {
	// 		return 0;
	// 	}
	// }

	function getFirstCraftCost(totals) {
		const asset = totals.first_component_craft_cost;
		const amount = asset.split(' ')[0]; // get the left amount part of '1.0000 SHELL'
		return Number(amount);
	}

	function getCurrentAttemptNum(craft, totals) {
		const craftEmpty = isCraftEmpty(craft);

		// if craft is empty, we can +1 the attempt num
		// as we want to show the % of the next one they will do
		if (craftEmpty) {
			return totals.component_crafts + 1;
		}

		return totals.component_crafts;
	}
	function getAttemptChances() {
		if (craftingConfig) {
			const allChances = craftingConfig.craft_attempt_chances;
			const activeChances = allChances.filter((e) => e.active_after <= $now);

			return activeChances.sort(dynamicSort('active_after'))[0];
		}
	}
	function getMaxAttempts() {
		return attempt_chances?.four_component_attempt_chances.length;
	}

	function getFailRate(attemptNo, insideNewCraftWindow, rarity) {
		if (attempt_chances) {
			if (attemptNo > attempt_chances?.four_component_attempt_chances?.length) {
				return 0;
			}

			const chances = attempt_chances.four_component_attempt_chances;
			const noChances = chances.filter((e) => e.attempt_num == attemptNo);
			if (noChances.length === 0) return 0;
			return noChances[0].fail_chance / 100;
		}

		/* 		// 40% for first attempt
		if (insideNewCraftWindow || attemptNo === 1) {
			return BASE_FAILURE_RATE;
		}

		// 55% for second attempt
		if (attemptNo === 2) {
			return $now < maxAttemptChangeTimestamp ? 55 : 50;
		}
		if (attemptNo === 3) {
			return $now < maxAttemptChangeTimestamp ? 70 : 60;
		}

		// 70% for third attempt
		return 70; */

		// Note: Old Logic below, keeping incase it comes back

		// if (!$craftingLog.user || remainingAttempts === 0) {
		// 	return BASE_FAILURE_RATE;
		// } else {
		// 	if ($craftingLog?.first_craft + 60 * 60 * 24 < $now) return BASE_FAILURE_RATE;
		// 	if (attemptNo === 1) return BASE_FAILURE_RATE;

		// 	// we use -1 here because we only want this to kick in after attempt 2+
		// 	return BASE_FAILURE_RATE + calcFailrate();
		// }
	}

	function onOkayAux(asset) {
		$craftingState['fourcomponent']['aux'] = asset[0];
	}
	$: maxAttempts = getMaxAttempts();
	let remainingAttempts = maxAttempts;
	$: remainingAttempts = $craftingLog
		? $craftingLog?.first_craft + 60 * 60 * 24 < $now
			? maxAttempts
			: maxAttempts - $craftingLog?.totals.component_crafts
		: maxAttempts;

	let animDelayBase = 50;

	$: abandonDisabled =
		!$craftingLog?.current_craft ||
		!$craftingLog?.current_craft?.asset_ids ||
		$craftingLog?.current_craft?.asset_ids?.length === 0 ||
		$waitingConfirmationCrafting ||
		$craftingStep == 4;
</script>

<svelte:window bind:innerWidth />
<div class="wrapper">
	<div class="top">
		<div class="attempts">
			<p>
				<span>Remaining attempts: </span>{!isNaN(remainingAttempts) ? remainingAttempts : ''}
				{#if remainingAttempts == 0}
					<div class="time-to-next">
						New Attempts: <NextAttemptTimer end={Number($craftingLog.first_craft + 86400)} />
					</div>
				{/if}
			</p>
		</div>
		<div class="grid" class:showAux class:no-actions={remainingAttempts == 0}>
			<div in:fade={{ delay: animDelayBase * 1 }}>
				<GpCard
					nftData={$craftingState.fourcomponent.slot1}
					type="fourcomponent"
					slot="slot1"
					cardType="ACTION IMAGE"
					filterType="action"
				/>
			</div>
			<div in:fade={{ delay: animDelayBase * 2 }}>
				<GpCard
					nftData={$craftingState.fourcomponent.slot2}
					type="fourcomponent"
					slot="slot2"
					cardType="DIORAMA"
					filterType="diorama"
				/>
			</div>
			<div in:fade={{ delay: animDelayBase * 3 }}>
				<GpCard
					nftData={$craftingState.fourcomponent.slot3}
					type="fourcomponent"
					slot="slot3"
					cardType="LORE TABLET"
					filterType="tablet"
				/>
			</div>
			<div in:fade={{ delay: animDelayBase * 4 }}>
				<GpCard
					nftData={$craftingState.fourcomponent.slot4}
					type="fourcomponent"
					slot="slot4"
					cardType="LORE COIN"
					filterType="coin"
				/>
			</div>
		</div>
		<div class="corner">
			<div class="aux">
				<div class="reset">
					<ResetIcon />
					<div class="reset-label">Reset Cooldowns</div>
				</div>

				<div class="aux-btn">
					<p>SHOW AUXILIARY PORT</p>
					<label class="switch">
						<input
							type="checkbox"
							bind:checked={showAux}
							on:click={() => {
								setTimeout(() => {
									showAux &&
										innerWidth < 1024 &&
										document.querySelector('.bottom').scrollIntoView({
											behavior: 'smooth',
											block: 'start'
										});
								}, 100);
							}}
						/>
						<span class="slider round" />
					</label>
				</div>
				{#if showAux}
					<div class="aux-wrapper" transition:slide={{ duration: 200 }}>
						{#if !$craftingState.fourcomponent.aux}
							<div
								on:click={() =>
									openInventory(InventoryMaster, {
										filterType: 'credit',
										slot: 'aux',
										rarity: 'auxcomponent',
										hasForm: true,
										onOkay: onOkayAux
									})}
								class="aux-port"
							>
								<div class="_placeholder">+</div>
							</div>
						{:else}
							<div class="selected-aux">
								<img
									style="max-width:300px;object-fit:scale-down"
									alt="Shellinium Credit"
									src={'https://res.cloudinary.com/green-rabbit-holdings/image/upload/c_scale/GreenRabbit/nfts/' +
										$craftingState.fourcomponent.aux.data.img +
										'.png'}
								/>
							</div>
						{/if}
						<!-- <p class="aux-name">{auxName}</p> -->
						<p class="port">AUXILIARY PORT</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="bottom">
		<div class="shell-cost">
			<img
				alt="Shell Processing Unit"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629214217/GreenRabbit/shell-icon.png"
			/>
			<div class="inner">
				<p class="title">Base Shellinium Cost</p>
				<p class="value">{toFixedCurrency(shelliniumCost, 2)}</p>
				<DesktopTooltip text={TOOLTIP_SHELLINIUM}>
					<img
						on:click={() => openModal(TOOLTIP_SHELLINIUM)}
						class="info-icon"
						alt="information"
						src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
					/>
				</DesktopTooltip>
			</div>
		</div>
		<div class="shell-spu">
			<img
				alt="Shell Processing Unit"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629214031/GreenRabbit/spu.png"
			/>
			<div class="inner">
				<p class="title">SPU Leasing Cost</p>
				<p class="value">{toFixedCurrency(spuFee, 2)}</p>
				<DesktopTooltip text={TOOLTIP_POWER_COST}>
					<img
						on:click={() => openModal(TOOLTIP_POWER_COST)}
						class="info-icon"
						alt="information"
						src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
					/>
				</DesktopTooltip>
			</div>
		</div>
		<div class="shell-failure-rate">
			<p class="title">Success rate</p>
			<p class="value">{failureRate == 0 ? '-' : `${100 - failureRate}%`}</p>

			<DesktopTooltip text={TOOLTIP_FAILURE_RATE}>
				<img
					on:click={() => openModal(TOOLTIP_FAILURE_RATE)}
					class="info-icon"
					alt="information"
					src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
				/>
			</DesktopTooltip>
		</div>

		<div class="stack-buttons">
			<CtaButton
				text={$craftingStep == 0
					? 'START CRAFTING'
					: $craftingStep == 1
					? 'CRAFT GREENPRINT'
					: $craftingStep == 2
					? 'SEND FUNDS'
					: $craftingStep == 3
					? 'ATTEMPT CRAFT'
					: $craftingStep == 4
					? 'CLAIM GREENPRINT'
					: ''}
				disabled={!(
					$craftingState.fourcomponent.slot1 &&
					$craftingState.fourcomponent.slot2 &&
					$craftingState.fourcomponent.slot3 &&
					$craftingState.fourcomponent.slot4
				) || $waitingConfirmationCrafting}
				onClick={() => {
					// Handle Claim
					if ($craftingStep == 4) {
						open(CraftingStatus, { buildFailed: false, claimClick }, stylingCraftStatus);
						return;
					}
					// Handle Completing Craft
					if ($craftingStep > 1) {
						handleCompleteCraft();
						return;
					}

					// Handle One-Click Craft
					handleOneClickCraft();
				}}
				loading={$waitingConfirmationCrafting}
				width={innerWidth < 1240 ? '305px' : '215px'}
				height="45px"
				margin={innerWidth < 1240 ? '0 auto' : '0 0 0 auto'}
				fontSize="14px"
			/>
			<div style="height:10px" />
			<CtaButton
				text="Abandon Craft"
				outlined={true}
				disabled={abandonDisabled}
				onClick={() => {
					abandonCraft();
				}}
				width={innerWidth < 1240 ? '305px' : '215px'}
				margin={innerWidth < 1240 ? '0 auto' : '0 0 0 auto'}
				height="45px"
				fontSize="14px"
			/>
		</div>
	</div>
</div>

<style>
	.reset {
		display: flex;
		flex-direction: row;
	}
	.reset-label {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 44px;
		margin-top: 7px;
	}
	.selected-aux img {
		width: 140px;
		height: 140px;
		margin: 0 auto;
	}
	div.inner img.info-icon,
	div.shell-failure-rate img.info-icon {
		width: 20px;
		height: 20px;
		position: absolute;
		top: 0;

		left: unset;
	}
	div.shell-spu div.inner img.info-icon {
		right: 0;
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
	.shell-cost,
	.shell-spu {
		display: flex;
		justify-content: center;
		position: relative;
		margin-bottom: 32px;
		padding: 0 40px;
	}
	div.inner {
		margin-left: 52px;
		position: relative;
	}

	.shell-cost img {
		width: 34px;
		height: 48px;
		position: absolute;
		left: 45px;
	}
	.shell-spu img {
		left: 35px;
		position: absolute;
		width: 46px;
		height: 36px;
	}
	.top,
	.bottom {
		background-color: #1c1c1c;
	}
	.top {
		padding: 26px 0px;
	}
	.bottom {
		margin: 22px auto 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: 22px 0;
	}
	.shell-failure-rate {
		/* align-self: flex-start; */
		/* margin-left: 90px; */
		margin-bottom: 26px;
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.port {
		font-weight: 600;
		text-align: center;
		width: 100%;
		position: relative;
		top: 45px;
	}
	.aux-name {
		text-align: center;
		width: 100%;
		margin: 14px 0;
	}
	._placeholder {
		width: 27px;
		height: 27px;
		border: 2px solid var(--primary-teal);
		border-radius: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--primary-teal);
		position: relative;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
	}
	.aux {
		padding: 0 14px;
		margin-top: 42px;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.aux-btn {
		display: flex;
		align-items: center;
		align-self: flex-end;
	}
	.aux-port {
		margin: 36px auto 0;
		padding: 0 14px;
		border: 2px dashed var(--greenish-cyan);
		border-radius: 75px;
		width: 140px;
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.aux p {
		margin-right: 16px;
		font-size: 13px;
		font-weight: 600;
	}
	.wrapper {
		max-width: 325px;
		margin: 0 auto;
		position: relative;
	}

	.attempts {
		padding: 0 14px;
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

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		box-shadow: 0 0 0 2px #fff;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}
	.no-actions {
		pointer-events: none;
	}
	input:checked + .slider {
		background-color: #141414;
		box-shadow: 0 0 0 2px var(--primary-teal);
	}

	input:focus + .slider {
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
		background-color: var(--primary-teal);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
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
		.reset-label {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-right: 44px;
			margin-top: 7px;
		}

		.attempts {
			padding: 0 30px;
			font-size: 19px;
			font-weight: 900;
		}
		.showAux {
			justify-content: flex-start !important;
		}
		.wrapper {
			max-width: 1240px;
		}

		.grid {
			justify-content: center;
			margin-left: 30px;
			gap: 16px;
		}

		.aux {
			position: absolute;
			top: 0;
			right: 0;
			margin-top: 16px;
			flex-direction: row;
		}
		.aux-wrapper {
			margin-top: 33px;
			margin-left: 30px;
			cursor: pointer;
		}
		.aux-name {
			margin: 32px 0 18px;
		}
		.aux-port {
			width: 173px;
			height: 173px;
			border-radius: 100px;
			background-color: #141414;
			box-shadow: 0 0 0 8px #141414;
		}

		.selected-aux img {
			width: 173px;
			height: 173px;
		}

		.bottom div {
			margin-bottom: 0;
		}
		.shell-failure-rate {
			align-self: center;
		}
		.bottom {
			height: 130px;
			flex-direction: row;
			align-items: center;
			padding: 0 50px;
		}

		.aux-wrapper p {
			margin: 0 auto;
			width: 180px;
			margin-top: 33px;
			font-size: 16px;
		}

		.info-icon {
			pointer-events: none;
		}

		.time-to-next {
			font-size: 14px;
			font-weight: 600;
		}
	}

	.stack-buttons {
		display: flex;
		flex-direction: column;
	}
</style>
