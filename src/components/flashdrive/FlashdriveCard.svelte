<script>
	import { image, initialize } from 'svelte-cloudinary';
	import { browser } from '$app/env';
	import CtaButton from '../CTAButton.svelte';

	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	// Hardcoding because safari sucks
	const rarityWidths = {
		common: '55px',
		uncommon: '65px',
		epic: '37px',
		legendary: '59px',
		mythic: '47px'
	};
	const sizes = {
		common: 32,
		uncommon: 128,
		epic: 512,
		legendary: 2048,
		mythic: 4096
	};

	export let nftData;
	let innerWidth;

	initialize({ cloud_name: 'green-rabbit-holdings' });
	let source = nftData?.data.img || nftData?.data.video;
	let src = `GreenRabbit/nfts/${source}.png`;

	let imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/GreenRabbit/nfts/${source}.png`;
	let showImage = true;

	$: source = nftData?.data.img || nftData?.data.video;
	$: imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/GreenRabbit/nfts/${source}.png`;
	import { getContext } from 'svelte';
	import AwaitingAuth from './AwaitingAuth.svelte';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import { activeUser, collectionsStore } from 'src/stores/store';
	const { open, close } = getContext('plugin-modal');

	async function handleEquipDrive(drive) {
		if (!$activeUser.accountName) return;
		open(AwaitingAuth);
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
						to: STAKING_CONTRACT,
						asset_ids: [drive.asset_id],
						memo: `equipdrives|${$collectionsStore[0].collection}`
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
				window.refreshFlashDrives(false, 0, (e) => {
					if (e) close();
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
</script>

<svelte:window bind:innerWidth />

{#if nftData}
	<div
		class="wrapper"
		class:selected={nftData.isSelected}
		style="--rarity-color: {rarities[nftData.data.Rarity.toLowerCase()]};"
	>
		<div class="top">
			<img alt={nftData.data.name} src={imageSource} class="image" />

			<div
				class="rarity"
				style="border-color:{rarities[nftData.data.Rarity.toLowerCase()]};
				--width:{rarityWidths[nftData.data.Rarity.toLowerCase()]};"
			>
				{nftData.data.Rarity.toLowerCase()}
			</div>
			<div class="collection">
				{nftData.data.Collection.toLowerCase()}
			</div>
		</div>
		<div class="bottom">
			<span>{nftData.name}</span>
			<span>{sizes[nftData.data.Rarity.toLowerCase()]} bits capacity</span>
			<CtaButton
				onClick={() => {
					close();
					handleEquipDrive(nftData);
				}}
				text="SELECT"
				width={innerWidth < 1024 ? '130px' : '200px'}
				height={innerWidth < 1024 ? '50px' : '35px'}
				fontSize="14px"
				margin="14px 0 0 "
			/>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		min-width: 100px;
		max-width: 155px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 285px;
		position: relative;
		overflow: hidden;
	}
	.wrapper:hover {
		box-shadow: 0 0 0 3px var(--primary-teal);
		cursor: pointer;
	}
	.selected {
		box-shadow: 0 0 0 3px var(--primary-teal) !important;
	}
	.wrapper:before {
		content: '';
		position: absolute;
		margin: -25px;
		width: 50px;
		height: 50px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
		z-index: 3;
	}

	.top {
		height: calc(285px - 125px);
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #343434;
		position: relative;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		font-size: 14px;
		color: var(--pure-white);
		height: 125px;
		background-color: var(--dark-grey);
		bottom: 0;
		padding: 0 8px 0;
	}
	.bottom span {
		width: 100%;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-weight: 900;
	}
	.bottom span:first-of-type {
		margin-top: 12px;
	}
	.bottom span:nth-child(2) {
		color: var(--primary-teal);

		margin-bottom: 14px;
	}

	.rarity {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		bottom: -9px;
		right: 5px;
		width: var(--width);
		padding: 0px 8px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.collection {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		height: 17px;

		bottom: -9px;
		left: 5px;
		width: 64px;
		padding: 0px 8px;
		border: 2px solid var(--primary-teal);
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.image {
		object-fit: scale-down;
		width: 42px;
		height: 125px;
	}

	@media (min-width: 481px) {
		.wrapper {
			height: 275px;
		}

		.top {
			height: calc(275px - 95px);
		}

		.bottom {
			height: 95px;
			font-size: 14px;
		}

		.image {
			width: 100px;
			height: 130px;
		}

		.mint {
			width: 40px;
		}

		.wrapper:before {
			margin: -30px;
			width: 60px;
			height: 60px;
		}
	}

	@media (min-width: 1024px) {
		.wrapper {
			max-width: 237px;
			max-height: 445px;
			min-width: 237px;
			min-height: 445px;
		}

		.top {
			height: calc(445px - 180px);
		}
		.bottom {
			height: 180px;
		}
		.bottom span {
			font-size: 17px;
		}
		.bottom span:first-of-type {
			margin-top: 22px;
			margin-bottom: 20px;
		}
		.collection,
		.rarity {
			width: 95px;
			padding: 8px 16px;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 30px;
			bottom: -15px;
			font-size: 12px;
		}

		.collection {
			left: 20px;
		}
		.rarity {
			right: 20px;
		}
	}
</style>
