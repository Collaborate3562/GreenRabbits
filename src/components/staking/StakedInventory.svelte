<script>
	import CTAButton from '../CTAButton.svelte';
	import NFTCard from '../cards/NFTCard.svelte';
	import FilterModal from '../FilterModal.svelte';
	import FilterDropdown from '../FilterDropdown.svelte';
	import { browser } from '$app/env';
	import {
		activeUser,
		assetsStore,
		collectionsStore,
		inventorySelected,
		lastSelected,
		scrollToID
	} from 'src/stores/store';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	export let drive;
	import { getContext, onMount } from 'svelte';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import { goto } from '$app/navigation';
	import UnstakeButton from './UnstakeButton.svelte';
	export let partner;
	const { open, close } = getContext('simple-modal');

	function resetSelects() {
		selectedRarity = rarityFilter[0];
		selectedSph = shellFilter[0];
		selectedType = typeFilter[0];
	}
	let selectedRarity, selectedSph, selectedType;

	let typeFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'T420 Art Diorama', id: 2, matcher: 'Diorama' },
		{ name: 'T420 Art Action', id: 3, matcher: 'Action' },
		{ name: 'T420 Art Coin', id: 4, matcher: 'Coin' },
		{ name: 'Lore Tablet', id: 5, matcher: 'Lore Tablet' },
		{ name: '3D Figure', id: 6, matcher: 'Figure' }
	];

	let shellFilter = [
		{ name: 'All', id: 1, min: 0, max: 0 },
		{ name: '1 - 499', id: 2, min: 1, max: 499 },
		{ name: '500 - 1,999', id: 3, min: 500, max: 1999 },
		{ name: '2000 - 9,999', id: 4, min: 2000, max: 9999 },
		{ name: '10,000 - 49,999', id: 5, min: 10000, max: 49999 },
		{ name: '50,000 - 99,999', id: 6, min: 50000, max: 99999 },
		{ name: '100,000+', id: 7, min: 100000, max: 0 }
	];

	let rarityFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Common - 4 bits', id: 2, matcher: 'Common' },
		{ name: 'Uncommon - 16 bits', id: 3, matcher: 'Uncommon' },
		{ name: 'Epic - 64 bits', id: 4, matcher: 'Epic' },
		{ name: 'Legendary - 256 bits', id: 5, matcher: 'Legendary' },
		{ name: 'Mythic - 512 bits', id: 6, matcher: 'Mythic' }
	];
	function clearSelects() {
		$assetsStore.forEach((e) => {
			e.isSelected = false;
		});
	}
	let selected = 0;
	let power = 0;
	let storage = 0;
	let generating = 0;
	$: {
		let tempGenerating = 0;
		$assetsStore
			.filter((asset) => asset.isStaked == drive.asset_id)
			.forEach((e) => {
				tempGenerating += e.weight;
			});
		generating = tempGenerating;
	}
	$: {
		let selectedList = $assetsStore.filter((asset) => asset.isSelected);
		selected = selectedList.length;
		let tempPower = 0;
		let tempSize = 0;
		selectedList.forEach((e) => {
			if (e.isSelected) {
				if ($lastSelected == 'staked') {
					tempPower -= e.weight;
					tempSize -= e.size;
				} else {
					tempPower += e.weight;
					tempSize += e.size;
				}
			}
		});
		power = tempPower;
		storage = tempSize;
	}

	async function handleUnequipDrive() {
		if (!$activeUser) return;

		open(AwaitingAuth);
		let transaction = {
			actions: [
				{
					account: STAKING_CONTRACT,
					name: 'unequipdrive',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName,
						collection: partner ? partner.collectionName : $collectionsStore[0].collection,
						asset_ids: [drive.asset_id]
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
					if (e) {
						if (partner) {
							window.getDrives();
							close();
							goto('/partner/' + partner.slug);
						} else {
							close();
							goto('/hub');
						}
					}
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	async function handleUnstake() {
		if (!$activeUser) return;
		open(AwaitingAuth);
		let asset_ids = [];

		$assetsStore
			.filter((asset) => asset.isStaked == drive.asset_id)
			.forEach((e) => {
				asset_ids.push(e.asset_id);
			});

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
						drive_id: drive.asset_id,
						asset_ids: asset_ids
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
	$: unstakeDisabled = $assetsStore.filter((asset) => asset.isStaked == drive.asset_id).length;
	$: unstakeMobileDisabled = $assetsStore.filter(
		(asset) => asset.isSelected && asset.isStaked == drive.asset_id
	).length;

	function indexOfAsset(asset_id) {
		const data = $assetsStore.filter((asset) => asset.isStaked == drive.asset_id);
		var i = 0;
		var ii = data.length;
		for (i; i < ii; i++) if (data[i].asset_id === asset_id) break;
		return i;
	}
	let cards;
	onMount(() => {
		if ($scrollToID) {
			/* const index = indexOfAsset($scrollToID); */
			/* 	cards.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); */
			var parentPos = cards.getBoundingClientRect(),
				childPos = document.getElementById($scrollToID).getBoundingClientRect(),
				relativePos = {};
			const top = childPos.top - parentPos.top;
			$inventorySelected = 'staked';

			$scrollToID = null;
			setTimeout(() => {
				cards.scrollTo({ top: top - 10, behavior: 'smooth' });
			}, 200);
		}
	});
</script>

<!-- Component that display all NFT Cards -->
<div
	class="wrapper"
	on:click={() => {
		if ($inventorySelected != 'staked') $inventorySelected = 'staked';
	}}
>
	<div class="header" class:selectedSection={$inventorySelected === 'staked'}>
		<div class="flash-info">
			<div class="flash-name">
				{#if partner}
					<img
						alt="Flash Drive"
						src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/partners/kyleloza/{drive.media.split(
							':'
						)[1]}.png"
					/>
				{:else}
					<img
						alt="Flash Drive"
						src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/{drive.media.split(
							':'
						)[1]}.png"
					/>
				{/if}
				<div class="flash-text">
					<p class="name">{drive.name}</p>
					<p class="flash-id">{drive.asset_id}</p>
				</div>
			</div>

			<CTAButton
				onClick={handleUnstake}
				outlined
				text="unstake all"
				fontSize="14px"
				width="130px"
				height="50px"
				disabled={!unstakeDisabled}
			/>
			<CTAButton
				onClick={handleUnequipDrive}
				outlined
				text="unplug"
				fontSize="14px"
				width="96px"
				height="50px"
				disabled={unstakeDisabled}
			/>
		</div>
		<div class="header-bot">
			<div class="storage">
				<div class="storage-text">
					<span>Storage</span>
					<span>
						<span class="used-bits">{drive.space_used}</span> / {drive.capacity} bits
					</span>
				</div>
				<div class="storage-bar-drive">
					<div class="progress-done" style="--storage-filled: {drive.fillPercent}%" />
				</div>
			</div>
			<div class="misc-info">
				<div>
					<span class="nft-info-title">Generating SHELL /h</span>
					<span>{toFixedCurrency(generating / 10000, 2)}</span>
				</div>
				<div>
					<span class="nft-info-title">NFTs staked</span>
					<span>{$assetsStore.filter((asset) => asset.isStaked == drive.asset_id).length}</span>
				</div>
			</div>
		</div>
	</div>
	{#if $assetsStore.filter((asset) => asset.isStaked == drive.asset_id).length}
		<div
			id="staked-inventory"
			class="staking-inventory"
			class:selectedSection={$inventorySelected === 'staked'}
			bind:this={cards}
		>
			{#each $assetsStore.filter((asset) => asset.isStaked == drive.asset_id) as nftData}
				<div
					id={nftData.asset_id}
					on:click={() => {
						if ($inventorySelected != 'staked' || $lastSelected != 'staked') clearSelects();
						nftData.isSelected = !nftData.isSelected;
						$lastSelected = 'staked';
					}}
				>
					<NFTCard {nftData} {partner} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="staking-inventory-empty" class:selectedSection={$inventorySelected === 'staking'}>
			<span
				style="  font-size: 24px;

	font-weight: bold;">The Flash Drive is Empty</span
			>
			<span
				style="  font-size: 18px;
	width:266px;text-align: center; margin-top:12px; opacity: 0.7;
	font-weight: normal;">Select NFTs from your inventory to stake them on the Flash Drive</span
			>
		</div>
	{/if}

	<!-- IF NO NFTS -->
	<!-- <div class="empty"><p>You haven’t staked any Green Rabbit or nVen0m NFTS promos</p></div> -->

	<div class={`shell-info shell-info-fixed`}>
		<div class="stake-info">
			<div class="border">
				<span class="type">SELECTED</span><span>{selected}</span>
				<svg width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 7">
					<defs />
					<path fill="#36ffc0" fill-rule="evenodd" d="M0 .5l5 5 5-5H0z" />
				</svg>
			</div>
			<div class="border">
				<span class="type">GENERATING SHELLINIUM /h</span><span
					>{toFixedCurrency(power / 10000, 2)}</span
				>
			</div>
			<div>
				<span class="type"> STORAGE AVAILABLE </span><span
					class:bits-err={drive.capacity - drive.space_used - storage < 0}
					>{drive.capacity - drive.space_used - storage} bits</span
				>
			</div>
		</div>
		<div class="cta-stake">
			<UnstakeButton {drive} disabled={!unstakeMobileDisabled} text="unstake" fontSize="14px" />
		</div>
	</div>
</div>

<!-- 

    breakpoints 
    @media (min-width: 481px){}
    @media (min-width: 768px){}
    @media (min-width: 1024px){}
    @media (mmin-width: 1201px){}
 -->
<style>
	.wrapper {
		background-color: black;
		border-collapse: collapse;
	}
	.selectedSection {
		box-shadow: 0 0 0 1px var(--primary-teal) !important;
	}
	.header {
		line-height: 1;
		color: white;
		border: 1px solid rgb(54, 255, 191, 0.4);
		height: 205px;

		max-width: 492px;
		margin: 0 auto;
		padding: 28px 16px;
	}

	.empty {
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		position: relative;
		min-width: 330px;
		max-width: calc(620px);
		display: grid;
		margin: 0 auto;
		row-gap: 8px;
		column-gap: 8px;
		padding: 28px;

		max-height: 700px;
		border: 1px solid rgb(54, 255, 191, 0.4);
		border-top: none;
	}

	.filter {
		display: flex;
		align-items: center;
	}
	.filter span {
		margin-left: 16px;
		cursor: pointer;
		color: var(--primary-teal);
	}

	.header-bot {
		display: flex;
		flex-direction: column;
	}
	.storage {
	}

	.stake-info div:first-of-type {
		position: relative;
	}
	.stake-info div:first-of-type svg {
		transform: rotate(270deg);
		height: 12px;
		position: absolute;
		right: -12px;
		top: 0;
		bottom: 0;
		margin: auto;
	}
	.storage-text {
		margin: 20px 0 8px;
		display: flex;
		justify-content: space-between;
	}
	.storage-bar-drive {
		background-color: #2e2e2e;
		border-radius: 20px;
		position: relative;
		margin: 0 0 15px;
		height: 10px;
		width: 100%;
	}
	.progress-done {
		background: var(--primary-teal);
		box-shadow: 0 0 6px 0 #36ffc0;
		border-radius: 20px;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: var(--storage-filled);
		opacity: 1;
		transition: 1s ease 0.3s;
		margin: 0;
	}
	.staking-inventory {
		position: relative;
		min-width: 330px;
		max-width: calc(620px);
		min-height: 700px;
		display: grid;
		margin: 0 auto;
		justify-content: center;
		grid-template-columns: repeat(3, minmax(100px, 165px));
		row-gap: 8px;
		column-gap: 8px;
		padding: 8px;

		height: 50vh;
		max-height: 700px;
		overflow-y: scroll;
		border: 1px solid rgb(54, 255, 191, 0.4);
		border-top: none;
	}
	.staking-inventory-empty {
		border: 1px solid rgb(54, 255, 191, 0.4);
		border-top: none;

		max-width: calc(620px);
		height: 700px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		color: white;
		margin: 0 auto;
	}
	.nft-info-title {
		color: var(--primary-teal);
	}

	.flash-info {
		display: flex;
		justify-content: space-between;
	}

	.misc-info {
		display: flex;
		justify-content: space-between;
	}
	.misc-info div {
		display: flex;
		flex-direction: column;
	}

	.misc-info div span:last-of-type {
		align-self: flex-end;
		margin-top: 4px;
	}
	.flash-name {
		display: flex;
		height: 50px;
	}
	.flash-name img {
		border: 1px solid var(--primary-teal);
		width: 50px;
		height: 50px;
		object-fit: contain;
	}

	.flash-text {
		display: flex;
		flex-direction: column;
		width: 130px;
		margin-left: 14px;
	}

	.name {
		font-size: 16px;
		font-weight: 900;
		margin-bottom: 4px;

		overflow: hidden;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		display: -webkit-box;
	}
	.flash-id {
		font-size: 13px;
	}

	.shell-info {
		background-color: var(--pure-black);
		border-top: 1px solid var(--primary-teal);
		border-bottom: 1px solid var(--primary-teal);
		/* position: absolute;
		top: calc(var(--inventory-height) - var(--at-bottom)); */
		height: 120px;
		width: 100%;
		max-width: 620px;
		color: white;
		z-index: 4;
		margin: 14px auto;
		font-size: 11px;

		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
	}
	.shell-info-fixed {
		z-index: 999;
		bottom: 0;
		position: sticky !important;
	}

	.border {
		border-right: 1px solid var(--dark-teal);
	}

	.stake-info {
		display: flex;
		flex: 1 0 auto;
		align-items: center;
		margin: 10px 10px;
		max-width: 620px;
		min-width: 350px;
		align-self: center;
	}

	.stake-info div {
		flex: 1;
		display: flex;
		flex-direction: column;
		text-align: center;
		padding: 0 4px;
		height: 100%;
	}

	.stake-info div span {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.stake-info .type {
		color: var(--text-grey);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.stake-info span {
		flex: 1;
	}

	.cta-stake {
		margin: 0 auto 10px;
	}

	.filter-desktop {
		display: none;
	}

	.bits-err {
		color: var(--danger);
	}

	@media (min-width: 481px) {
		.header {
			max-width: 620px;
		}
	}

	@media (min-width: 768px) {
		.header-bot {
			flex-direction: row;
		}
		.storage {
			flex: 0 0 220px;
		}
		.misc-info {
			flex: 1;
			align-items: center;
		}

		.misc-info {
			margin-left: 40px;
		}
		.staking-inventory {
			padding: 8px 26px 134px 82px;
			justify-content: left;
		}

		.header {
			padding: 26px 32px 16px;
			height: 185px;
		}

		.flash-info {
			margin-bottom: 20px;
		}
	}
	@media (min-width: 1259px) {
		.wrapper {
			margin-left: 10px;
		}
		.staking-inventory {
			height: 100%;
		}
		.filter-mobile {
			display: none;
		}
		.filter-desktop {
			display: flex;
		}
		.shell-info {
			display: none;
		}
		.header {
			height: 184px;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
		}
	}
</style>
