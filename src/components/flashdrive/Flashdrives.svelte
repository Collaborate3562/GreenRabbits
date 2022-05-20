<script>
	import { goto } from '$app/navigation';
	import {
		drivesStore,
		dataLoaded,
		userBalance,
		accountStore,
		storageStore,
		promoBalancesStore,

		promoAssetsStore,
		assetsStore

	} from 'src/stores/store';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { fade, slide } from 'svelte/transition';
	import SimpleModal from '../SimpleModal.svelte';
	import ClaimButton from './ClaimButton.svelte';
	import PlugIn from './PlugIn.svelte';
	import UsbStakingInfo from './USBStakingInfo.svelte';

	import StakingBoard from './StakingBoard.svelte';

	import { partners } from 'src/utils/partners';


	let promoBalance = 0,
		promoPower = 0;
	let psn_available = 0,
		psn_staked = 0,
		psn_shell = 0,
		psn_atc = 0;
	let prn_available = 0,
		prn_staked = 0,
		prn_shell = 0,
		prn_atc = 0;
	let exn_available = 0,
		exn_staked = 0,
		exn_shell = 0,
		exn_atc = 0;

	$: {
		let balanceTemp = 0;
		let powerTemp = 0;
		$promoBalancesStore.forEach((e) => {
			balanceTemp += Number(e.balance.balance);
			powerTemp += Number(e.balance.staked);
		});
		promoBalance = balanceTemp;
		promoPower = powerTemp;

		let stakedTemp = 0;
		let tempPower = 0;
		let availableTemp = 0;
		partners.forEach((e) => {
			$assetsStore.forEach((element) => {
				if (element.collection.collection_name == e.collectionName) {
					if (element.isStaked && element.isStakeable) {
						stakedTemp++;
						tempPower += element.weight;
					} else if (element.isStakeable && !element.isStaked) {
						availableTemp++;
					}
				}
			});
		});

		psn_available = availableTemp;
		psn_staked = stakedTemp;
		psn_shell = tempPower;

		if ($promoAssetsStore) {
			let prn_stakedTemp = 0,
				prn_availableTemp = 0,
				prn_shellTemp = 0;
			let exn_stakedTemp = 0,
				exn_availableTemp = 0,
				exn_shellTemp = 0;
			$promoAssetsStore.forEach((e) => {
				e.data.forEach((element) => {
					if (element.schema.schema_name !== 'exclusives') {
						if (element.isStaked && element.isStakeable) {
							prn_stakedTemp++;
							prn_shellTemp += element.weight;
						} else if (element.isStakeable) prn_availableTemp++;
					}
				});
			});
			prn_shell = prn_shellTemp;
			prn_available = prn_availableTemp;
			prn_staked = prn_stakedTemp;

			$promoAssetsStore.forEach((e) => {
				e.data.forEach((element) => {
					if (element.schema.schema_name === 'exclusives') {
						if (element.isStaked && element.isStakeable) {
							exn_stakedTemp++;
							exn_shellTemp += element.weight;
						} else if (element.isStakeable) exn_availableTemp++;
					}
				});
			});
			exn_shell = exn_shellTemp;
			exn_available = exn_availableTemp;
			exn_staked = exn_stakedTemp;
		}
	}
	$: totalCollected = Number($accountStore?.collected?.split(' ')[0]) + promoBalance;

	import { now } from 'src/stores/store';
	import { TESTNET } from 'src/utils/config';

	let activeSince = TESTNET ? 1636502873 : 1637539200;
	$: isActive = activeSince <= $now;
</script>

{#if $dataLoaded}
	<div class="wrapper">
		<div class="header">
			<img
				class="greentooth"
				alt="Greentooth Staking System"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1628689408/GreenRabbit/greentooth.png"
			/>
			<img
				in:fade={{ delay: 500, duration: 1000 }}
				class="greentooth-desktop"
				alt="Greentooth Staking System"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1628692652/GreenRabbit/greentooth_desktop.png"
			/>
			<div class="shell-info">
				<div in:slide={{ delay: 300 }}>
					<span>Total Shellinium</span>
					<span class="teal">{toFixedCurrency($userBalance, 2)}</span>
				</div>
				<div in:slide={{ delay: 500 }}>
					<span>Total Shell/h</span>
					<span class="teal"
						>{$storageStore.staked
							? toFixedCurrency((Number($storageStore.staked) + Number(promoPower)) / 10000, 2)
							: '0.00'}</span
					>
				</div>
				{#if $accountStore}
					<div in:slide={{ delay: 700 }}>
						<span>Total Available to claim</span>
						<span class="teal">{toFixedCurrency(totalCollected, 2)}</span>
					</div>
				{/if}
			</div>
			<div class="claim-info">
				{#if $accountStore}
					<div
						class:disabled={$accountStore.collected == '0.0000 SHELL' && promoBalance == 0.0}
						in:fade={{ delay: 900 }}
						style="width: 100%;"
					>
						<ClaimButton
							disabled={$accountStore.collected == '0.0000 SHELL' && promoBalance == 0.0}
						/>
					</div>
				{/if}
			</div>
		</div>
		<UsbStakingInfo />
		<SimpleModal key="plugin-modal">
			<div class="usb">
				{#each { length: 5 } as _, i}
					<div in:fade={{ delay: i * 100 }}>
						{#if $drivesStore[i]}
							<div
								on:click={() => {
									goto(`/hub/${$drivesStore[i].asset_id}`);
								}}
							>
								<PlugIn drive={$drivesStore[i]} />
							</div>
						{:else}
							<PlugIn />
						{/if}
					</div>
				{/each}
			</div>
		</SimpleModal>

		{#if isActive}
			<StakingBoard
				title="Partner Staking NFTs"
				btn_label="STAKE PARTNERS"
				claimForward="partner"
				available={psn_available}
				staked={psn_staked}
				shell={psn_shell}
				atc={psn_atc}
			/>
		{/if}

		<StakingBoard
			title="Promo NFTs"
			btn_label="STAKE PROMO"
			claimForward="promo"
			available={prn_available}
			staked={prn_staked}
			shell={prn_shell}
			atc={prn_atc}
		/>
		<StakingBoard
			title="Exclusive NFTs"
			btn_label="STAKE EXCLUSIVES"
			claimForward="exclusive"
			available={exn_available}
			staked={exn_staked}
			shell={exn_shell}
			atc={exn_atc}
		/>
	</div>
{/if}

<style>
	.wrapper {
		color: white;
	}

	.teal {
		color: var(--primary-teal);
		font-weight: 20px;
	}

	.shell-info {
		display: flex;
		align-items: center;
		width: 45%;
		justify-content: space-around;
	}

	.claim-info {
		display: flex;
		padding: 0;
		justify-content: space-between;
		align-items: center;
		width: 15%;
	}

	.shell-info div {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 18px;
		font-weight: 600;
	}

	.header {
		display: flex;
		max-width: 1264px;
		margin: 0 auto 42px;
		width: 96%;
	}

	.greentooth-desktop {
		width: 250px;
		height: 60px;
		display: block;
		margin-right: 20%;
	}

	.greentooth {
		width: 300px;
		height: 32px;
		margin: 35px auto;
		display: none;
	}

	.usb {
		max-width: 1264px;
		margin: 0 auto;
		margin-top: 80px;
		position: relative;
		display: grid;
		justify-content: center;
		gap: 80px 16px;
		grid-template-columns: repeat(auto-fit, minmax(240px, max-content));
		margin-bottom: 40px;
	}

	.disabled {
		cursor: not-allowed;
	}

	@media (max-width: 1024px) {
		.greentooth-desktop {
			margin-right: 5%;

		}
		.shell-info {
			width: 53%;
		}

	}

	@media (max-width: 768px) {
		.greentooth-desktop {
			display: none;
		}
		.greentooth {
			display: block;
		}
		.header {
			flex-direction: column;
			width: 100%;
			padding: 0 10px;
		}
		.shell-info {
			width: 100%;
			flex-direction: column;
		}
		.shell-info div {
			width: 100%;
			flex-direction: row;
			justify-content: space-between;
			border-bottom: 1px solid #171717;
			padding-top: 5px;
			font-size: 16px;
		}
		.shell-info div:last-child {
			border-bottom: none;
		}
		.claim-info {
			width: 100%;
			margin-top: 30px;
		}
		.teal {
			font-weight: 18px;
		}
		.usb {
			grid-template-columns: repeat(auto-fit, minmax(155px, max-content));
			gap: 35px 7px;
			margin-top: 50px;
		}
	}
</style>
