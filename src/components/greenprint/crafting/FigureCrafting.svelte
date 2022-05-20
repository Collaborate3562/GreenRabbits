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
	import DesktopTooltip from '../overlays/DesktopTooltip.svelte';
	import {
		activeUser,
		allAssetsStore,
		craftingLog,
		craftingResult,
		craftingState,
		craftingStepFigure,
		dataLoaded,
		now,
		waitingConfirmationCrafting
	} from 'src/stores/store';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import CraftingStatus from '../overlays/CraftingStatus.svelte';
	import {
		get_spu_fee,
		resolveAfterSeconds,
		isCraftEmpty,
		resolveAfterMS,
		get_spu_fee_config,
		dynamicSort
	} from 'src/utils/helpers';
	import AwaitingAuth from 'src/components/flashdrive/AwaitingAuth.svelte';
	import { CRAFTING_CONTRACT, TOKEN_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import NextAttemptTimer from 'src/components/NextAttemptTimer.svelte';
	import InventoryMaster from '../overlays/InventoryMaster.svelte';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import ResetIcon from 'src/components/misc/ResetIcon.svelte';

	import { browser } from '$app/env';

	let stylingCraftStatus;
	let attempt_chances;
	$: {
		if ($now && craftingConfig) {
			attempt_chances = getAttemptChances();
		}
	}
	const BASE_SPU_FEE_PERCENT = 5;
	const TWENT_FOUR_HOURS_IN_SECONDS = 60 * 60 * 24;
	const BASE_FAILURE_RATE = 40; // 40%

	const FIGURE_FIRST_ATTEMPT_FAIL_CHANCE = 40;
	const FIGURE_SECOND_ATTEMPT_FAIL_CHANCE = 65;
	const FIGURE_ADDITIONAL_ATTEMPT_FAIL_CHANCE = 10; // attempts 3+
	const COMPONENT_FAIL_CHANCE_PER_ATTEMPT = 8;
	let craftingConfig;

	onMount(async () => {
		if (browser) {
			if (!craftingConfig) {
				craftingConfig = await greenRabbitApi.fetchCraftingConfig();
				attempt_chances = getAttemptChances();
				setInitialAttempts();
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

	const claimClick = () => {
		$waitingConfirmationCrafting = true;
		handleClaim();
	};

	function onOkayAux(asset) {
		$craftingState['figurecrafting']['aux'] = asset[0];
	}

	let craftingInProgress = false;
	let craftingInAttempt = false;
	let showAux = false;
	let auxSelected = false;
	let auxName = 'Greenprint Shellinium Credit';
	let innerWidth;
	let data = true;

	$: {
		if ($craftingLog && $dataLoaded && !craftingInProgress) {
			if (
				$craftingLog.current_craft.asset_ids.length == 1 &&
				!$craftingState.figurecrafting.status
			) {
				$craftingState.figurecrafting.slot1 = $allAssetsStore.filter(
					(item) => item.asset_id == $craftingLog.current_craft.asset_ids[0]
				)[0];
				if ($craftingLog.current_craft.aux_slot.length) {
					atomicAssetsApi.getAssetsById($craftingLog.current_craft.aux_slot).then((res) => {
						$craftingState.figurecrafting.aux = res.data[0];
						$craftingStepFigure = 3;
						showAux = true;
						craftingInAttempt = true;
						$craftingState.figurecrafting.status = 1;
					});
				} else {
					craftingInAttempt = true;
					$craftingState.figurecrafting.status = 1;
					$craftingStepFigure = 2;
				}

				if (
					($craftingLog.current_craft.craft_fee_paid ||
						$craftingLog.current_craft.aux_slot.length) &&
					($craftingLog.current_craft.spu_fee_paid ||
						$craftingLog.current_craft.spu_fee == '0.0000 SHELL')
				) {
					$craftingStepFigure = 3;

					if ($craftingLog.current_craft.crafted) {
						const asset_id = $craftingLog.current_craft.outcome;

						greenRabbitApi.fetchCraftOutcome(asset_id).then((template_data) => {
							$craftingResult = template_data[0];

							$craftingStepFigure = 4;
							open(CraftingStatus, { buildFailed: false, claimClick }, stylingCraftStatus);
						});
					}
				}
			}
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

	let maxAttempts = 2;
	let remainingAttemptsCommon = 0;
	let remainingAttemptsUncommon = 0;
	let remainingAttemptsEpic = 0;
	let remainingAttemptsLegendary = 0;
	let remainingAttemptsMythic = 0;
	function setInitialAttempts() {
		remainingAttemptsCommon = getRemainingAttempts($craftingLog, 'Common');
		remainingAttemptsUncommon = getRemainingAttempts($craftingLog, 'Uncommon');
		remainingAttemptsEpic = getRemainingAttempts($craftingLog, 'Epic');
		remainingAttemptsLegendary = getRemainingAttempts($craftingLog, 'Legendary');
		remainingAttemptsMythic = getRemainingAttempts($craftingLog, 'Mythic');
	}

	function getRemainingAttempts($craftingLog, rarity) {
		if (attempt_chances) {
			if (!$craftingLog) {
				return getMaxAttempts(rarity);
			}

			const newCraftWindowTime = $craftingLog.first_craft + TWENT_FOUR_HOURS_IN_SECONDS;
			const insideNewCraftWindow = newCraftWindowTime < $now;

			if (insideNewCraftWindow) {
				return getMaxAttempts(rarity);
			}

			const figureTotal = getFigureTotal(rarity, $craftingLog?.totals);
			return getMaxAttempts(rarity) - figureTotal.crafts;
		}
	}

	$: remainingAttemptsCommon = getRemainingAttempts($craftingLog, 'Common');
	$: remainingAttemptsUncommon = getRemainingAttempts($craftingLog, 'Uncommon');
	$: remainingAttemptsEpic = getRemainingAttempts($craftingLog, 'Epic');
	$: remainingAttemptsLegendary = getRemainingAttempts($craftingLog, 'Legendary');
	$: remainingAttemptsMythic = getRemainingAttempts($craftingLog, 'Mythic');

	function isCraftDisabled($craftingLog, $craftingState, waitingConfirmationCrafting) {
		if (waitingConfirmationCrafting) {
			return true;
		}

		if (!$craftingState?.figurecrafting?.slot1) {
			return true;
		}

		// if we can't find a figure rarity, its safe to default to disabled
		// as they likely dont have a figure selected
		const figureRarity = $craftingState?.figurecrafting?.slot1?.data?.Rarity;
		if (!figureRarity) {
			return true;
		}

		// if craft is in progress, crafting shouldn't be disabled
		const craftEmpty = isCraftEmpty($craftingLog?.current_craft);
		if (!craftEmpty) {
			return false;
		}

		const attemptsLeft = getRemainingAttempts($craftingLog, figureRarity);
		return attemptsLeft === 0;
	}

	let craftingDisabled = false;

	// Handle reactive updating of crafting disabled
	$: {
		craftingDisabled = isCraftDisabled($craftingLog, $craftingState, $waitingConfirmationCrafting);
	}

	let isBoosted = 0;
	let spuFee = 0;
	let failrate = 0;

	let shelliniumCost = 0;
	function getCost(asset) {
		const config = craftingConfig.figure_base_costs.filter((e) => e.key == asset.data.Rarity)[0];

		return config.value;
	}

	$: {
		if ($craftingState && craftingConfig) {
			let shellCostTemp = 0;
			if ($craftingState.figurecrafting.slot1)
				shellCostTemp += getCost($craftingState.figurecrafting.slot1);

			shelliniumCost = shellCostTemp / 10000;
		}
	}

	// let rarityIndexes = {
	// 	Common: 0,
	// 	Uncommon: 1,
	// 	Epic: 2,
	// 	Legendary: 3,
	// 	Mythic: 4
	// };

	/* 	if(is_first_craft) {
        new_craft.fail_chance = 0;
    } else {
        uint64_t base_fail_chance = FIGURE_SECOND_ATTEMPT_FAIL_CHANCE;
        // we use -2 as we only want additional to kick in on attempts 3+
        uint64_t additional_fail_chance = ((attempt_num - 2) * FIGURE_ADDITIONAL_ATTEMPT_FAIL_CHANCE);
        uint64_t fail_percent = base_fail_chance + additional_fail_chance;
        new_craft.fail_chance = fail_percent;
    } */

	function getFailRate(attemptNo, insideNewCraftWindow, rarity) {

		if (!attempt_chances?.figure_attempt_chances) {
			return 0;
		}

		const chances = attempt_chances.figure_attempt_chances.filter((e) => e.key == rarity)[0];
		const chanceValues = chances.value.filter((e) => e.attempt_num == attemptNo);
		if (chanceValues.length === 0) return 0;
		return chanceValues[0].fail_chance / 100;

		// 40% for first attempt
		/* if (insideNewCraftWindow || attemptNo === 1) {
			return BASE_FAILURE_RATE;
		} */

		// 65% for second attempt
		/* return 65; */

		// Note: Old way of doing stuff below
		// left it here incase it comes back later

		// let attemptNo =
		// 	$craftingLog.totals.figure_crafts[
		// 		rarityIndexes[$craftingState.figurecrafting.slot1.data.Rarity]
		// 	].crafts + 1;
		// if (!$craftingLog.user) {
		// 	return FIGURE_FIRST_ATTEMPT_FAIL_CHANCE;
		// } else {
		// 	if ($craftingLog?.first_craft + 60 * 60 * 24 < $now) return FIGURE_FIRST_ATTEMPT_FAIL_CHANCE;
		// 	if (attemptNo == 2) {
		// 		return FIGURE_SECOND_ATTEMPT_FAIL_CHANCE;
		// 		// const base_fail_chance = FIGURE_SECOND_ATTEMPT_FAIL_CHANCE;
		// 		// const additional_fail_chance = (attemptNo - 2) * FIGURE_ADDITIONAL_ATTEMPT_FAIL_CHANCE;
		// 		// return base_fail_chance + additional_fail_chance;
		// 	} else if (attemptNo == 1) {
		// 		return FIGURE_FIRST_ATTEMPT_FAIL_CHANCE;
		// 	}
		// 	return FIGURE_FIRST_ATTEMPT_FAIL_CHANCE;
		// 	// we use -1 here because we only want this to kick in after attempt 2+
		// 	/* return ($craftingLog.totals.component_crafts - 1) * COMPONENT_FAIL_CHANCE_PER_ATTEMPT; */
		// }
	}

	function getFirstCraftCost(total) {
		const asset = total.first_craft_cost;
		const amount = asset.split(' ')[0]; // get the left amount part of '1.0000 SHELL'
		return Number(amount);
	}

	function getFigureTotal(rarity, totals) {
		return totals.figure_crafts.find((total) => {
			return total.rarity === rarity;
		});
	}

	function getCurrentAttemptNum(craft, figureTotal) {
		const craftEmpty = isCraftEmpty(craft);

		// if craft is empty, we can +1 the attempt num
		// as we want to show the % of the next one they will do
		if (craftEmpty) {
			return figureTotal.crafts + 1;
		}

		return figureTotal.crafts;
	}
	function calculate_spu_fee(firstCraftCost, attemptNo) {
		let spu_fee = 0;

		if (!craftingConfig?.figure_spu_multipliers) {
			return spu_fee;
		}

		if ($craftingState.figurecrafting.slot1)
			spu_fee += get_spu_fee_config(
				craftingConfig.figure_spu_multipliers,
				getCost($craftingState.figurecrafting.slot1) / 10000,
				attemptNo,
				$craftingState.figurecrafting.slot1.data.Rarity
			);

		return spu_fee;
	}
	function handleUpdateCraftValues($craftingLog, $figurecrafting) {
		const gotFigure = $craftingLog && $figurecrafting?.slot1;

		// handle new users with no craft log or no figure selected
		if (!$craftingLog || !gotFigure) {
			failrate = 0; // default fail rate of 40%
			spuFee = 0;
			isBoosted = 0;
			return;
		}

		const figureRarity = $figurecrafting?.slot1?.data?.Rarity;
		const newWindowTime = $craftingLog.first_craft + TWENT_FOUR_HOURS_IN_SECONDS;
		const insideNewCraftWindow = newWindowTime < $now;

		const figureTotal = getFigureTotal(figureRarity, $craftingLog.totals);
		const attemptNo = getCurrentAttemptNum($craftingLog.current_craft, figureTotal);
		const firstCraftCost = getFirstCraftCost(figureTotal);

		isBoosted = getBoostAssets().length;

		// handle SPU fee calc
		if (!insideNewCraftWindow) {
			spuFee = calculate_spu_fee(firstCraftCost, attemptNo);
		}

		// handle calc craft fail rate
		failrate = getFailRate(attemptNo, insideNewCraftWindow, figureRarity);
	}

	$: {
		handleUpdateCraftValues($craftingLog, $craftingState?.figurecrafting);
	}

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
					$craftingStepFigure = 1;
					close();
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			window.refreshCraftLogs(false, 2000, () => {});
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	};

	function getAttemptChances() {
		if (craftingConfig) {
			const allChances = craftingConfig.craft_attempt_chances;
			const activeChances = allChances.filter((e) => e.active_after <= $now);

			return activeChances.sort(dynamicSort('active_after'))[0];
		}
	}

	function getMaxAttempts(rarity) {
		if (!attempt_chances) return 0;
		return attempt_chances.figure_attempt_chances.filter((e) => e.key == rarity)[0].value.length;
	}
	function isFirstCraft(rarity) {
		if ((rarity = 'Common')) {
			if (remainingAttemptsCommon == getMaxAttempts(rarity)) return true;
		}
		if ((rarity = 'Uncommon')) {
			if (remainingAttemptsUncommon == getMaxAttempts(rarity)) return true;
		}
		if ((rarity = 'Epic')) {
			if (remainingAttemptsEpic == getMaxAttempts(rarity)) return true;
		}
		if ((rarity = 'Legendary')) {
			if (remainingAttemptsLegendary == getMaxAttempts(rarity)) return true;
		}
		if ((rarity = 'Mythic')) {
			if (remainingAttemptsMythic == getMaxAttempts(rarity)) return true;
		}
		return false;
	}

	function getBoostAssets() {
		const asset_id = $craftingState.figurecrafting.slot1.asset_id;
		const rarity = $craftingState.figurecrafting.slot1.data.Rarity;
		const filter = { name: '3D Figure', id: 6, matcher: 'Figure' };
		let ids = [];
		//if (isFirstCraft($craftingState.figurecrafting.slot1.data.Rarity)) return ids;
		let boostassets = $allAssetsStore
			.filter((asset) => {
				let prelimChecks =
					asset.data.Rarity == rarity && asset.data.Class == 'Figure' && asset.asset_id != asset_id;

				if (!prelimChecks) {
					return false;
				}

				let neverUsed = !asset.mutable_data['Last Used'];
				if (neverUsed) {
					return true;
				}

				let lastUsed = Number(asset.mutable_data['Last Used']);
				let cooldownSeconds = 3600 * (12 * Number(asset.mutable_data['Status Type']));

				let cooldownUntil = lastUsed + cooldownSeconds;

				return $now > cooldownUntil;
			})
			.slice(0, 5);
		for (let boost of boostassets) {
			ids.push(boost.asset_id);
		}

		return ids;
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
					asset_ids: [$craftingState.figurecrafting.slot1.asset_id]
				}
			}
		];

		// Handle boosting craft
		const boost_ids = getBoostAssets();
		if (boost_ids?.length > 0) {
			actions.push({
				account: CRAFTING_CONTRACT,
				name: 'boost',
				authorization,
				data: {
					user,
					asset_ids: boost_ids
				}
			});
		}

		// If Aux Slot isn't empty, add the credit transfer
		if ($craftingState.figurecrafting.aux) {
			actions.push({
				account: 'atomicassets',
				name: 'transfer',
				authorization,
				data: {
					from: user,
					to: CRAFTING_CONTRACT,
					asset_ids: [$craftingState.figurecrafting.aux.asset_id],
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
			$craftingStepFigure = 4;
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
					$craftingStepFigure = 1;
					close();
				}
			};
		}

		open(CraftingStatus, opts, stylingCraftStatus);
	}

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

		if (actions.length) {
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
						$craftingStepFigure = 1;

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
	}

	$: abandonDisabled =
		!$craftingLog?.current_craft ||
		!$craftingLog?.current_craft?.asset_ids ||
		$craftingLog?.current_craft?.asset_ids?.length === 0 ||
		$waitingConfirmationCrafting ||
		$craftingStepFigure == 4;
</script>

<svelte:window bind:innerWidth />
<div class="wrapper">
	<div class="top">
		<div class="attempts">
			<p>Remaining attempts:</p>
			<div class="grid-wrapper">
				<div class="attempt-rarity">
					<p class="rarity-grid">
						COMMON: <span>{remainingAttemptsCommon ? remainingAttemptsCommon : ''}</span>
					</p>
					{#if remainingAttemptsCommon == 0}
						<span class="time-to-next"
							>New Attempt: <span
								><NextAttemptTimer end={Number($craftingLog.first_craft + 86400)} /></span
							>
						</span>
					{/if}
				</div>
				<div class="attempt-rarity">
					<p class="rarity-grid">
						UNCOMMON: <span>{remainingAttemptsUncommon ? remainingAttemptsUncommon : ''}</span>
					</p>
					{#if remainingAttemptsUncommon == 0}
						<span class="time-to-next"
							>New Attempt: <span
								><NextAttemptTimer end={Number($craftingLog.first_craft + 86400)} /></span
							>
						</span>
					{/if}
				</div>
				<div class="attempt-rarity">
					<p class="rarity-grid">
						EPIC: <span>{remainingAttemptsEpic ? remainingAttemptsEpic : ''}</span>
					</p>
					{#if remainingAttemptsEpic == 0}
						<span class="time-to-next"
							>New Attempt: <span
								><NextAttemptTimer end={Number($craftingLog.first_craft + 86400)} /></span
							>
						</span>
					{/if}
				</div>
				<div class="attempt-rarity">
					<p class="rarity-grid">
						LEGENDARY: <span>{remainingAttemptsLegendary ? remainingAttemptsLegendary : ''}</span>
					</p>
					{#if remainingAttemptsLegendary == 0}
						<span class="time-to-next"
							>New Attempt: <span
								><NextAttemptTimer end={Number($craftingLog.first_craft + 86400)} /></span
							>
						</span>
					{/if}
				</div>
				<div class="attempt-rarity">
					<p class="rarity-grid">
						MYTHIC: <span>{remainingAttemptsMythic ? remainingAttemptsMythic : ''}</span>
					</p>
					{#if remainingAttemptsMythic == 0}
						<span class="time-to-next"
							>New Attempt: <span
								><NextAttemptTimer end={Number($craftingLog.first_craft + 86400)} /></span
							>
						</span>
					{/if}
				</div>
			</div>
		</div>
		<div class="grid" class:showAux>
			<div in:fade={{ delay: 50 }}>
				<GpCard
					nftData={$craftingState.figurecrafting.slot1}
					type="figurecrafting"
					slot="slot1"
					filterType="figure"
					cardType="3D FIGURE"
				/>
			</div>
		</div>
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
					{#if !$craftingState.figurecrafting.aux}
						<div
							on:click={() =>
								openInventory(InventoryMaster, {
									filterType: 'credit',
									slot: 'aux',
									rarity: 'figure' + $craftingState.figurecrafting.slot1.data.Rarity,
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
									$craftingState.figurecrafting.aux.data.img +
									'.png'}
							/>
						</div>
					{/if}
					<!-- <p class="aux-name">{auxName}</p> -->
					<p class="port">AUX PORT</p>
				</div>
			{/if}
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
			<div>
				<p class="title">Success rate</p>
				<p class="value">{failrate == 0 ? '-' : `${100 - (failrate - isBoosted * 2)}%`}</p>
			</div>
			{#if isBoosted}
				<span class="shell-help">
					<img alt="up arrow" src="/assets/shell-help.png" />
				</span>
			{/if}
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
				text={$craftingStepFigure == 0
					? 'START CRAFTING'
					: $craftingStepFigure == 1
					? 'CRAFT GREENPRINT'
					: $craftingStepFigure == 2
					? 'COMPLETE CRAFT'
					: $craftingStepFigure == 3
					? 'COMPLETE CRAFT'
					: $craftingStepFigure == 4
					? 'CLAIM GREENPRINT'
					: ''}
				onClick={() => {
					if ($craftingStepFigure == 4) {
						open(CraftingStatus, { buildFailed: false, claimClick }, stylingCraftStatus);
						return;
					}
					if ($craftingStepFigure > 1) {
						handleCompleteCraft();
						return;
					}
					handleOneClickCraft();
				}}
				loading={$waitingConfirmationCrafting}
				width={innerWidth < 1240 ? '305px' : '215px'}
				height="45px"
				margin={innerWidth < 1240 ? '0 auto' : '0 0 0 auto'}
				fontSize="14px"
				disabled={craftingDisabled}
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
	.shell-help img {
		height: 25px;
		width: 15px;
	}
	span.shell-help {
		position: relative;
		margin-left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 45px;
		height: 45px;
		border: solid 1px var(--greenish-cyan);
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}
	.time-to-next {
		font-size: 13px;
	}

	.attempts > p {
		margin-bottom: 14px;
		font-weight: 900;
	}

	p.rarity {
		font-weight: 600;
	}
	p.rarity span {
		font-weight: 400;
	}
	.grid-wrapper {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(127px, 127px));
		gap: 14px 35px;
		justify-content: center;
		padding: initial;
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
		display: flex;
		flex-direction: row;
		margin-bottom: 26px;
		position: relative;
	}
	.port {
		font-weight: 600;
		text-align: center;
		width: 100%;
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
		background-color: unset;
	}
	.aux {
		padding: 0 14px;
		margin-top: 42px;
		display: flex;
		flex-direction: row;
		position: relative;
		cursor: pointer;
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
		margin-top: 10px;
		padding: 0 18px;
	}
	.attempt-rarity {
		line-height: 20px;
	}
	.grid {
		margin: 56px auto 0;
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
		.grid-wrapper {
			justify-content: flex-start;
			gap: 0 80px;
		}
		.rarity-grid {
			white-space: nowrap;
		}
		.attempts {
			padding: 0 30px;
			font-size: 19px;
			font-weight: 900;
		}
		.showAux {
			/* justify-content: flex-start !important; */
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
		}
		.aux-wrapper {
			margin-top: 33px;
			position: absolute;
			top: 100px;
			right: 256px;
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
			margin-left: 30px;
		}
		.bottom {
			height: 130px;
			flex-direction: row;
			align-items: center;
			padding: 0 50px 0 0;
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
	}

	.stack-buttons {
		display: flex;
		flex-direction: column;
	}
</style>
