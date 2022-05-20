<script>
	import { goto } from '$app/navigation';
	import CtaButton from 'src/components/CTAButton.svelte';
	import AwaitingAuth from 'src/components/flashdrive/AwaitingAuth.svelte';
	import { activeUser, assetsStore, lastSelected, scrollToID } from 'src/stores/store';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import { getContext } from 'svelte';

	const { open, close } = getContext('simple-modal');
	let innerWidth;
	export let nftData;
	function selectNFT(id) {
		for (let nft of $assetsStore) {
			if (nft.asset_id == id) {
				nft.isSelected = true;
				return;
			}
		}
	}

	async function handleUnstake(asset) {
		if (!$activeUser) return;
		open(AwaitingAuth);

		let transaction = {
			actions: [
				{
					account: STAKING_CONTRACT,
					name: 'unstake',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName,
						drive_id: asset.isStaked,
						asset_ids: [asset.asset_id]
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

			setTimeout(() => {
				window.refreshAssets(false, 0, (e) => {
					if (e) {
						close();
					}
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
</script>

<svelte:window bind:innerWidth />
<div class="nft-staked">
	<div class="content">
		<div class="box">
			<img alt="staked circle" src="/assets/staked-circle.png" />

			<p>NFT IS STAKED</p>

			<CtaButton
				outlined
				text="UNSTAKE"
				fontSize="14px"
				width={innerWidth < 1024 ? '145px' : '160px'}
				height="40px"
				onClick={() => {
					handleUnstake(nftData);
					/* 	$lastSelected = 'staked';
					selectNFT(nftData.asset_id);
					$scrollToID = nftData.asset_id;
					goto(`/hub/${nftData.isStaked}`); */
				}}
			/>
		</div>
	</div>
</div>

<style>
	.nft-staked {
		z-index: 100;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: -45px;
		margin: auto;
	}
	.nft-staked img {
		display: none;
	}
	.box p {
		font-size: 13px;
		color: white;
		font-weight: 900;
		margin-bottom: 12px;
	}

	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		width: 160px;
		height: 100px;
		position: relative;
		border-radius: 2px;
		border: solid 2px #484848;
		background-color: rgba(0, 0, 0, 1);
	}
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	@media (min-width: 1024px) {
		.inner {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 33px;
		}
		.nft-staked {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			top: 0;
			margin: auto;
		}
		.nft-staked img {
			width: 45px;
			height: 45px;
			position: relative;
			left: 0;
			right: 0;
			margin: 0 auto;
			top: -35px;
		}
		.box p {
			font-size: 15px;
			color: white;
			font-weight: 900;
		}

		.box {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			width: 185px;
			height: 115px;
			position: relative;
			border-radius: 2px;

			border: solid 1px #484848;

			background-color: rgba(0, 0, 0, 1);
		}
		.content {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
		}
	}
</style>
