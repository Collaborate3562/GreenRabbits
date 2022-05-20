<script>
	import {
		accountStore,
		activeUser,
		drivesStore,
		isDataLoading,
		isDataWaiting,
		modal,
		promoBalancesStore,
		promoCollectionsStore,
		storageStore
	} from 'src/stores/store';
	import {
		PROMO_CONTRACT,
		REFRESH_INTERVAL_SECONDS,
		STAKING_CONTRACT,
		TRANSACTION_TIMEOUT_MS
	} from 'src/utils/config';
	import { resolveAfterSeconds, zeroPad } from 'src/utils/helpers';
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	import PromoCard from '../cards/PromoCard.svelte';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import AwaitingAuth from './AwaitingAuth.svelte';

	import { getContext } from 'svelte';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	const { open, close } = getContext('simple-modal');
	export let disabled = false;
	let countdown;
	let interval;

	async function waitTillClaim() {
		let claimData = null;
		let promoData = false;
		let stakingData = false;

		$isDataWaiting = true;
		while (!claimData) {
			const promoBalances = await greenRabbitApi.fetchPromoBalance(
				$activeUser,
				$promoCollectionsStore
			);

			promoBalances.forEach((e) => {
				if (e.balance.staked > 0) {
					if (e.balance.balance != '0.00') {
						promoData = true;
					}
				} else {
					promoData = true;
				}
			});
			var accountData;

			if ($storageStore.staked > 0) {
				const account = await greenRabbitApi.fetchAccount($activeUser);
				if (account.collected != '0.0000 SHELL') {
					stakingData = true;
					accountData = account;
				}
			} else {
				stakingData = true;
				accountData = $accountStore;
			}

			claimData = promoData && stakingData;
			if (claimData) {
				$accountStore = accountData;
				$promoBalancesStore = promoBalances;
				$isDataWaiting = false;
			} else {
				await resolveAfterSeconds(3);
			}
		}
	}
	onMount(() => {
		interval = setInterval(() => {
			var d = new Date();
			const timer =
				zeroPad(60 - (d.getMinutes() + 1), 2) + ':' + zeroPad(60 - (d.getSeconds() + 1), 2);
			countdown = timer;

			if (d.getSeconds() % REFRESH_INTERVAL_SECONDS == 0) {
				if (!$isDataWaiting) window.refreshStakingStats(false, 0);
			}
			if (d.getSeconds() + 1 == 0 && 60 - (d.getMinutes() + 1) == 0) waitTillClaim();
		}, 1000);
	});
	onDestroy(() => clearInterval(interval));
	async function handleClaim() {
		if (!$activeUser.accountName) return;
		open(AwaitingAuth);

		/*  setAwaitingConfirmation(1) */
		let transaction = {
			actions: []
		};
		if ($accountStore.collected != '0.0000 SHELL') {
			transaction.actions.push({
				account: STAKING_CONTRACT,
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
			});
		}

		$promoBalancesStore.forEach((p) => {
			if (Number(p.balance.balance) > 0) {
				transaction.actions.push({
					account: PROMO_CONTRACT,
					name: 'claim',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName,
						collection: p.collection
					}
				});
			}
		});

		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			setTimeout(() => {
				window.refreshStakingStats(false, 0, (e) => {
					if (e) close();
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			/*   addToast(err.message, { appearance: 'error' })
      setAwaitingConfirmation(0) /////////SHOW ERROR TOAST */
		}
	}
</script>

<div class="wrapper">
	<button
		on:click={() => {
			handleClaim();
		}}
		class:disabled
		>{#if !$storageStore.staked}CLAIM{:else if $isDataWaiting}<LoadingSpinner
				width="25"
				height="25"
			/>{:else}CLAIM {#if disabled && countdown}IN
				{countdown}{/if}{/if}</button
	>
</div>

<style>
	.wrapper {
		width: 100%;
		display: flex;
		align-items: center;
	}
	button {
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		padding: 12px;
		width: 100%;
		color: white;
		white-space: nowrap;
		border: solid 1px #36ffc0;
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}

	.disabled {
		opacity: 0.5;
		pointer-events: none;
		background-image: linear-gradient(
			to right,
			rgba(68, 190, 152, 0.3) 3%,
			rgba(32, 144, 109, 0.3) 84%
		);
	}
</style>
