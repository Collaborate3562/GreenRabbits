<script>
	import { loading } from 'src/stores/missionStores';

	import { activeUser, collectionsStore, isDataLoading } from 'src/stores/store';
	import { driveAssetsStore } from 'src/stores/store';
	import { REDEEM_CONTRACT } from 'src/utils/config';
	import ChestCard from './ChestCard.svelte';
	import CtaButton from './CTAButton.svelte';
	import AwaitingAuth from './flashdrive/AwaitingAuth.svelte';
	export let refreshChests;
	import { getContext } from 'svelte';
	const { open, close } = getContext('simple-modal');
	import LoadingSpinner from './LoadingSpinner.svelte';
	import RedeemSuccess from './RedeemSuccess.svelte';
	export let chests;
	let innerWidth;
	async function clearSelects() {
		for (let chest of chests.filter((e) => e.isSelected)) {
			chest.isSelected = undefined;
		}
	}

	async function handleRedeem() {
		$loading = true;
		let redeemItems = [];
		let totalRedeemed = 0;
		let rewards = [];
		for (let chest of chests) {
			if (chest.isSelected) {
				redeemItems.push(chest.asset_id);

				for (let reward of chest.reward) {
					if (rewards.filter((e) => e.name == reward.split(' ')[1]).length) {
						rewards.filter((e) => e.name == reward.split(' ')[1])[0].amount += Number(
							reward.split(' ')[0]
						);
					} else {
						rewards.push({ name: reward.split(' ')[1], amount: Number(reward.split(' ')[0]) });
					}
				}
			}
		}

		let transaction = {
			actions: [
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
						to: REDEEM_CONTRACT,
						asset_ids: redeemItems,
						memo: 'redeemchest'
					}
				}
			]
		};

		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			close();
			open(AwaitingAuth);
			setTimeout(() => {
				close();
				open(
					RedeemSuccess,
					{ rewards, refreshChests },
					innerWidth > 1024
						? {
								styleWindow: {
									maxWidth: '550px',
									minWidth: '550px',
									minHeight: '550px',
									maxHeight: '550px'
								},
								styleContent: {
									position: 'initial',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									minHeight: '550px'
								}
						  }
						: {
								styleWindow: {
									maxWidth: '100vw',
									minWidth: '100vw',
									minHeight: '100vh',
									maxHeight: '100vh'
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
									position: 'initial',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									minHeight: '550px'
								}
						  }
				);
			}, 3000);
		} catch (err) {
			refreshChests(false);
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
</script>

<svelte:window bind:innerWidth />
<div class="">
	<div class="ModalTitle">
		Shellinium Chests <!-- <div class="ModalCloseBtn" /> -->
		<div class="ModalSubtitle">Select the chests you’d like to redeem</div>
	</div>
	<div class="ModalContent">
		<div class="NFTCardWrapper">
			{#each chests as nftData}
				<ChestCard
					onClick={() => {
						nftData.isSelected = !nftData.isSelected;
					}}
					{nftData}
				/>
			{/each}
		</div>
	</div>
	<div class="ButtonWrapper">
		<div class="InfoOuter">
			<div class="InfoWrapper">
				<div class="Info">Chests selected</div>
				<div class="InfoColor">{chests.filter((e) => e.isSelected).length}</div>
			</div>
			<!-- <div class="InfoWrapper">
				<div class="Info">Total Shellinium</div>
				<div class="InfoColor">
				213
				</div>
			</div> -->
		</div>
		<div class="MobileWrap">
			<CtaButton text="Redeem" fontSize={'20px'} height={'45px'} onClick={handleRedeem} />
		</div>
	</div>
</div>

<style>
	.MobileWrap {
		margin-right: 220px;
		margin-top: 9px;
	}
	.InfoWrapper {
		display: flex;
		flex-direction: column;
		margin-right: 37px;
		margin-left: 27px;
	}
	.ButtonWrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;

		border-top: solid 3px #36ffc0;
	}
	.NFTCardWrapper {
		max-width: 1600px;
		min-height: 600px;
		margin: 0 auto;
		padding-bottom: 48px;
		justify-items: center;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}

	.InfoOuter {
		padding-right: 20px;
		display: flex;
		padding-top: 8px;
	}

	.ModalContent {
		max-height: 529px;
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
		padding: 0 40px;
	}
	.ModalSubtitle {
		font-size: 18px;
		padding-bottom: 36px;
		font-weight: normal;
		width: 100%;
	}
	.ModalCloseBtn {
		background: url('/game_assets/modal_close.svg');
		background-repeat: repeat;
		background-repeat: no-repeat;
		position: relative;
		float: right;
		margin-right: -6px;
		width: 29px;
		height: 29px;
		object-fit: contain;
		cursor: pointer;
	}
	.ModalTitle {
		font-size: 28px;
		font-weight: bold;
		color: #ffffff;
		padding: 28px 42px 0px 42px;
	}
	.USBModal {
		max-width: 1100px;
		min-width: 1100px;
		min-height: 748px;
		border: solid 3px #36ffc0;
		background: #000;
	}
	.no__items {
		height: 680px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.grid {
		width: 100%;
		height: 680px;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(237px, max-content));
		gap: 11px;
		justify-content: center;
		padding: initial;
	}
	h1 {
		font-size: 24px;
		font-weight: bold;
		text-align: center;
		position: absolute;
		top: 0px;
		left: 0px;
	}
	.Info {
		font-size: 18px;

		font-weight: 500;
		color: white;

		width: 205px;
		text-align: right;
	}
	.InfoColor {
		font-size: 22px;

		font-weight: bold;

		text-align: right;

		color: #36ffc0;
	}
	.wrapper {
		padding-top: 55px;
		position: relative;
		max-width: 1500px;
		max-height: 750px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.innerContent {
		width: 100%;
		overflow-y: auto;
	}
	@media (max-width: 1024px) {
		.wrapper {
			min-width: 100%;
		}

		.grid {
			grid-template-columns: repeat(auto-fit, minmax(145px, max-content));
		}
	}
	@media (max-width: 400px) {
		.ModalContent {
			padding: 0;
		}
	}
	@media (max-height: 650px) {
		.ModalContent {
			max-height: 529px;
		}
	}
	@media (max-width: 1100px) {
		.USBModal {
			max-width: 100vw;
			min-width: 100vw;
			border: none;
			border-top: solid 3px #36ffc0;
			max-height: 100vh;
			min-height: 100vh;
		}
		.ButtonWrapper {
			position: fixed;
			bottom: 0px;
			background: black;
		}
		.InfoWrapper {
			display: none;
		}
		.MobileWrap {
			margin: 0 auto;
			padding-top: 20px;
			padding-bottom: 10px;
		}
	}
	@media screen and (max-width: 1067px) {
		.NFTCardWrapper {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
	@media screen and (max-width: 790px) {
		.NFTCardWrapper {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
