<script>
	import CTAButton from '../CTAButton.svelte';
	import NFTCard from '../cards/NFTCard.svelte';
	import FilterModal from '../FilterModal.svelte';
	import FilterDropdown from '../FilterDropdown.svelte';
	import { browser } from '$app/env';
	import { inventorySelected, lastSelected } from 'src/stores/store';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { onMount, onDestroy } from 'svelte';
	export let drive;

	import { getCooldownData } from 'src/utils/helpers';
	let child;
	export let partner = null;
	import { activeUser, assetsStore } from 'src/stores/store';

	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';

	import { getContext } from 'svelte';
	const { open, close } = getContext('simple-modal');
	async function handleStake() {
		if (!$activeUser) return;
		open(AwaitingAuth);
		let asset_ids = [];

		$assetsStore
			.filter((asset) => asset.isSelected == true)
			.forEach((e) => {
				asset_ids.push(e.asset_id);
			});

		let transaction = {
			actions: [
				{
					account: STAKING_CONTRACT,
					name: 'stake',
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
	function resetSelects() {
		selectedRarity = rarityFilter[0];
		selectedSph = shellFilter[0];
		selectedType = typeFilter[0];
	}
	let selectedRarity, selectedSph, selectedType;

	let typeFilter = partner
		? partner.typeFilter
		: [
				{ name: 'All', id: 1, matcher: 'All' },
				{ name: 'T420 Art Diorama', id: 2, matcher: 'Diorama' },
				{ name: 'T420 Art Action', id: 3, matcher: 'Action' },
				{ name: 'T420 Art Coin', id: 4, matcher: 'Coin' },
				{ name: 'Lore Tablet', id: 5, matcher: 'Lore Tablet' },
				{ name: '3D Figure', id: 6, matcher: 'Figure' }
		  ];

	let shellFilter = partner
		? partner.shellFilter
		: [
				{ name: 'All', id: 1, min: 0, max: 0 },
				{ name: '1 - 499', id: 2, min: 1, max: 499 },
				{ name: '500 - 1,999', id: 3, min: 500, max: 1999 },
				{ name: '2000 - 9,999', id: 4, min: 2000, max: 9999 },
				{ name: '10,000 - 49,999', id: 5, min: 10000, max: 49999 },
				{ name: '50,000 - 99,999', id: 6, min: 50000, max: 99999 },
				{ name: '100,000+', id: 7, min: 100000, max: 0 }
		  ];

	let rarityFilter = partner
		? partner.rarityFilter
		: [
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
	onMount(() => {
		if (browser) window.clearSelects = clearSelects;
	});
	onDestroy(() => {
		clearSelects();
	});
	resetSelects();
	let selected = 0;
	let power = 0;
	let storage = 0;
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

	function applyRarityFilter(asset) {
		if (selectedRarity.name == 'All') return true;
		return asset.data.Rarity == selectedRarity.matcher;
	}

	function applyTypeFilter(asset) {
		if (selectedType.name == 'All') return true;
		return asset.data.Class == selectedType.matcher;
	}
	function applyShellFilter(asset) {
		if (selectedSph.name == 'All') return true;

		return asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max;
	}
	function isNotOnCooldown(nftData) {
		if (
			Object.keys(nftData.mutable_data).length === 0 &&
			nftData.mutable_data.constructor === Object
		) {
			return true;
		}
		let cooldownEndsUnixTs = getCooldownData(nftData);

		return new Date().getTime() / 1000 > cooldownEndsUnixTs;
	}
</script>

<!-- Component that display all NFT Cards -->
<div
	class="wrapper"
	on:click={() => {
		if ($inventorySelected != 'staking') $inventorySelected = 'staking';
	}}
>
	<div class="header" class:selectedSection={$inventorySelected === 'staking'}>
		<p>Inventory</p>
		<div class="filter">
			<!-- mobile -->
			<div class="filter-mobile">
				<FilterModal bind:this={child} />

				<CTAButton
					onClick={() => child.toggleModal()}
					outlined
					text="FILTERS"
					fontSize="14px"
					width="145px"
					height="50px"
				/>
			</div>

			<!-- desktop -->
			<div class="filter-desktop">
				<FilterDropdown
					width="180px"
					text="Rarity"
					bind:selected={selectedRarity}
					filterItems={rarityFilter}
				/>
				<FilterDropdown
					width="150px"
					text="Shellinium/h range"
					bind:selected={selectedSph}
					filterItems={shellFilter}
				/>
				<FilterDropdown
					width="150px"
					text="Type"
					bind:selected={selectedType}
					filterItems={typeFilter}
				/>
			</div>
			<span on:click={resetSelects}>Reset</span>
		</div>
	</div>
	{#if partner}{#if $assetsStore.filter((asset) => asset.isStaked == null && asset.isStakeable && (asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All') && (asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') && ((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) || selectedSph.name == 'All')).length}
			<div class="staking-inventory" class:selectedSection={$inventorySelected === 'staking'}>
				{#each $assetsStore.filter((asset) => asset.isStaked == null && asset.isStakeable && asset.collection.collection_name == partner.collectionName && (asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All') && (asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') && ((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) || selectedSph.name == 'All')) as nftData}
					<div
						on:click={() => {
							if (isNotOnCooldown(nftData)) {
								if ($inventorySelected != 'staking' || $lastSelected != 'staking') clearSelects();
								nftData.isSelected = !nftData.isSelected;
								$lastSelected = 'staking';
							}
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

	font-weight: bold;">Your inventory is empty</span
				>
				<!-- 	<span
			style="  font-size: 18px;
	width:206px;text-align: center; margin-top:12px; opacity: 0.7;
	font-weight: normal;">Buy them on the market or get them from packs.</span
		> -->
			</div>{/if}
	{:else if $assetsStore.filter((asset) => asset.isStaked == null && asset.isStakeable && (asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All') && (asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') && ((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) || selectedSph.name == 'All')).length}
		<div class="staking-inventory" class:selectedSection={$inventorySelected === 'staking'}>

			{#each $assetsStore.filter((asset) => asset.isStaked == null && asset.isStakeable && (partner ? asset.collection.collection_name == partner.collectionName : asset.collection.collection_name == 'greenrabbitx' || asset.collection.collection_name == 'greenrabbit') && (asset.schema.schema_name == 'characters' || asset.schema.schema_name == 'totems') && (asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All') && (asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') && ((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) || selectedSph.name == 'All')) as nftData}

				<div
					on:click={() => {
						if (isNotOnCooldown(nftData)) {
							if ($inventorySelected != 'staking' || $lastSelected != 'staking') clearSelects();
							nftData.isSelected = !nftData.isSelected;
							$lastSelected = 'staking';
						}
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

		font-weight: bold;">Your inventory is empty</span
			>
			<!-- 	<span
				style="  font-size: 18px;
		width:206px;text-align: center; margin-top:12px; opacity: 0.7;
		font-weight: normal;">Buy them on the market or get them from packs.</span
			> -->
		</div>{/if}
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
			<CTAButton
				onClick={() => {
					handleStake();
				}}
				disabled={drive.capacity - drive.space_used - storage < 0 ||
					$lastSelected != 'staking' ||
					selected == 0}
				text="stake"
				fontSize="14px"
			/>
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
	.no__items {
		width: 100%;

		height: 680px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		color: white;
	}
	.wrapper {
		background-color: black;
		border-collapse: collapse;
	}
	.header {
		line-height: 1;
		color: white;
		border: 1px solid rgb(54, 255, 191, 0.4);
		height: 130px;

		max-width: 492px;
		margin: 0 auto;
		padding: 26px 30px 16px;
	}
	.selectedSection {
		box-shadow: 0 0 0 1px var(--primary-teal) !important;
	}
	.bits-err {
		color: var(--danger);
	}

	.header p {
		font-size: 22px;
		margin: 0 0 18px;
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
	.filter {
		display: flex;
		align-items: center;
	}
	.filter span {
		margin-left: 16px;
		cursor: pointer;
		color: var(--primary-teal);
	}
	.staking-inventory {
		position: relative;
		min-width: 330px;
		max-width: calc(620px);
		display: grid;
		margin: 0 auto;
		justify-content: center;
		grid-template-columns: repeat(3, minmax(100px, 165px));
		row-gap: 8px;
		column-gap: 8px;
		padding: 8px;
		margin: 0 auto;

		height: 50vh;
		min-height: 700px;
		max-height: 700px;
		overflow-y: scroll;
		border: 1px solid rgb(54, 255, 191, 0.4);
		border-top: none;
	}
	.staking-inventory-empty {
		border: 1px solid rgb(54, 255, 191, 0.4);
		border-top: none;
		width: 100%;
		height: 700px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		color: white;
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
		bottom: 0;
		position: sticky !important;
		z-index: 999;
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

	@media (min-width: 481px) {
		.header {
			max-width: 620px;
		}
	}

	@media (min-width: 768px) {
		.staking-inventory {
			padding: 8px 62px 8px 24px;
			justify-content: left;
		}
		.staking-inventory-empty {
			margin: 0 auto;
		}

		.header {
			padding: 26px 32px 16px;
		}
	}
	@media (min-width: 1259px) {
		.wrapper {
			margin-right: 10px;
		}
		.staking-inventory {
			height: 100%;
			min-height: 700px;
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
