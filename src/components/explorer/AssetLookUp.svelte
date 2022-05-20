<script>
	import FilterDropdown from 'src/components/FilterDropdown.svelte';
	import LoaderDots from 'src/components/misc/LoaderDots.svelte';
	import Input from 'src/components/Input.svelte';
	import AssetLookUpCard from './AssetLookUpCard.svelte';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import CtaButton from '../CTAButton.svelte';
	import { goto } from '$app/navigation';
	import { getBoostData, isEmpty, isPromoStaked } from 'src/utils/helpers';
	import getStakingData from 'src/utils/matcher';
	import { CRAFTING_CONTRACT, PROMO_CONTRACT, STAKING_CONTRACT } from 'src/utils/config';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import NumberInput from '../NumberInput.svelte';
	import { activeUser } from 'src/stores/store';

	let newBatch = [];
	let data = [];
	let page = 1;
	let dataLoaded = false;
	let lastFilter = null;
	let selectedRarity;
	let selectedType;
	let selectedSort;
	let weights, promoWeights;
	let delayTimer;
	let IdFilter = '';
	let outcomes;
	let workingIdFilter = '';
	let nameFilter = '';
	let workingNameFilter = '';
	let typeFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Art Diorama', id: 2, matcher: 'Diorama' },
		{ name: 'Art Action', id: 3, matcher: 'Action' },
		{ name: 'Coin', id: 4, matcher: 'Coin' },
		{ name: 'Lore Tablet', id: 5, matcher: 'Lore Tablet' },
		{ name: '3D Figure', id: 6, matcher: 'Figure' },
		{ name: 'Greenprint', id: 7, matcher: 'Greenprint' },
		{ name: 'Flash Drive', id: 8, matcher: 'Flash Drive' },
		{ name: 'Chest', id: 9, matcher: 'Chest' },
		{ name: 'Orb', id: 10, matcher: 'Orb' },
		{ name: 'Credit', id: 11, matcher: 'Credit' },
		{ name: 'Packs', id: 12, matcher: '_packs' },
		{ name: 'Promo', id: 13, matcher: '_promo' },
		{ name: 'OG Concept', id: 14, matcher: '_ogconcept' },
		{ name: 'OG Albert', id: 15, matcher: '_ogalbert' },
		{ name: 'Redemptions', id: 16, matcher: '_redemptions' },
		{ name: 'Exclusives', id: 17, matcher: '_exclusives' }
	];
	let priceSort = [
		{ name: 'Newest', id: 1, sort: 'created', order: 'desc' },
		{ name: 'Oldest', id: 2, sort: 'created', order: 'asc' },
		{ name: 'Highest price', id: 2, sort: 'price', order: 'desc' },
		{ name: 'Lowest price', id: 2, sort: 'price', order: 'asc' },
		{ name: 'Highest mint', id: 2, sort: 'template_mint', order: 'desc' },
		{ name: 'Lowest mint', id: 2, sort: 'template_mint', order: 'asc' }
	];
	let rarityFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Common', id: 2, matcher: 'Common' },
		{ name: 'Uncommon', id: 3, matcher: 'Uncommon' },
		{ name: 'Epic', id: 4, matcher: 'Epic' },
		{ name: 'Legendary', id: 5, matcher: 'Legendary' },
		{ name: 'Mythic', id: 6, matcher: 'Mythic' }
	];

	$: {
		if (typeof IdFilter === 'number' || typeof IdFilter === 'string') {
			if (String(IdFilter).length > 2) {
				let data = [];
				newBatch = [];
				let page = 1;
				let perPage = 10;
				workingIdFilter = String(IdFilter).toLowerCase();
				loadOffersData(() => {}, workingIdFilter);
			}
		}
	}
	$: {
		if (typeof nameFilter === 'number' || typeof nameFilter === 'string') {
			if (String(nameFilter).length > 3) {
				let data = [];
				newBatch = [];
				let page = 1;
				let perPage = 10;
				workingNameFilter = String(nameFilter).toLowerCase();
				search();
			}
		}
	}
	$: data = [...data, ...newBatch];
	async function loadOffersData(callback = () => {}, id, onChange = false) {
		if (onChange) {
			newBatch = [];
			data = [];
		}
		if (lastFilter != id) data = [];
		if (id) lastFilter = id;
		dataLoaded = false;
		const rarity = selectedRarity.name != 'All' ? selectedRarity.name : null;
		const type = selectedType.name != 'All' ? selectedType.matcher : null;
		const name = nameFilter || null;
		const offers = await atomicAssetsApi.getOffersPost(
			id,
			id ? 1 : page,
			rarity,
			type,
			name,
			selectedSort
		);

		if (offers && offers.length) {
			matchWeights(offers, weights);
			dataLoaded = true;
			callback();
			return;
		}
		if (id) {
			const asset = await atomicAssetsApi.getAssetsByIdAndCollection([id], 'greenrabbit');
			matchWeights(asset.data, weights, true);
			dataLoaded = true;
			callback();
			return;
		}
		if (page > 1) page--;
		dataLoaded = true;
		callback();
	}
	function matchOutcomes(asset, outcomes) {
		for (let outcome in outcomes) {
			if (
				outcomes[outcome].totem == asset.data.Totem &&
				outcomes[outcome].rarity == asset.data.Rarity
			) {
				return outcomes[outcome].base_attributes;
			}
		}
	}
	async function matchWeights(assets, weights, soloasset = false) {
		if (!assets || !weights) return;
		let c = 0;
		if (assets.length != 0) {
		}
		for (let asset of assets) {
			c++;
			asset.isStakeable = false;
			asset.weight = 0;
			asset.size = 0;
			var stakingData = {};
			if (soloasset) {
				if (asset.schema.schema_name == 'greenprints' && outcomes) {
					asset.baseStats = matchOutcomes(asset, outcomes);
					asset.bonusStats = getBoostData(asset);
				}
			} else {
				if (asset.assets[0].schema.schema_name == 'greenprints' && outcomes) {
					asset.assets[0].baseStats = matchOutcomes(asset.assets[0], outcomes);
					asset.assets[0].bonusStats = getBoostData(asset.assets[0]);
				}
			}

			for (let e of weights) {
				if (isEmpty(stakingData))
					if (!soloasset) stakingData = getStakingData(asset.assets[0], e.configs, e.schema);
					else stakingData = getStakingData(asset, e.configs, e.schema);
			}
			if (!isEmpty(stakingData)) {
				asset.isStakeable = true;
				asset.weight = stakingData.weight;
				asset.size = stakingData.size;
			}
			if (c == assets.length) {
				newBatch = assets;
			}
		}
	}

	async function search() {
		clearTimeout(delayTimer);
		delayTimer = setTimeout(async function () {
			loadOffersData(() => {}, null, true);
		}, 1000); // Will do the ajax stuff after 1000 ms, or 1 s
	}
	function resetSearch() {
		workingIdFilter = '';
		IdFilter = '';
		nameFilter = '';
		workingNameFilter = '';
		lastFilter = null;
		data = [];
		newBatch = [];
		page = 1;
		loadOffersData();
	}
	onMount(async () => {
		if (browser) {
			const weightsMain = await greenRabbitApi.fetchWeights(STAKING_CONTRACT);

			const promoWeightsMain = await greenRabbitApi.fetchWeights(PROMO_CONTRACT);

			weights = weightsMain.concat(promoWeightsMain);

			const outcomesMain = await greenRabbitApi.fetchOutcomes(CRAFTING_CONTRACT);
			outcomes = outcomesMain;
			loadOffersData();
		}
	});
</script>

<svelte:head>
	<title>Asset Lookup | GreenRabbit Game</title>
</svelte:head>
<div class="wrapper">
	{#if $activeUser.accountName}
		<div class="btnInventory" on:click={() => goto('/inventory')}>
			<img src="/arrow.svg" alt="" /> INVENTORY
		</div>
	{/if}
	<h1 class="title">GR Asset Lookup</h1>
	<h2 class="subtitle" Style="font-weight:600">Search for GR Collection Assets</h2>
	<div class="mobileFilters">
		<div class="btnFilters">Filters</div>
		<Input
			margin="0 17px 0 0 "
			bind:value={IdFilter}
			placeholder="Search For NFT"
			width="257px"
			text=""
		/>
	</div>
	<div class="filters">
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Sort by"
			onChange={() => loadOffersData(() => {}, null, true)}
			bind:selected={selectedSort}
			filterItems={priceSort}
		/>
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Class"
			onChange={() => loadOffersData(() => {}, null, true)}
			bind:selected={selectedType}
			filterItems={typeFilter}
		/>
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Rarity"
			bind:selected={selectedRarity}
			onChange={() => loadOffersData(() => {}, null, true)}
			filterItems={rarityFilter}
		/>
		<NumberInput
			margin="0 17px 0 0 "
			bind:value={IdFilter}
			placeholder="Asset ID"
			width="257px"
			text="Filter by ID"
		/>
		<Input
			margin="0 17px 0 0 "
			bind:value={nameFilter}
			placeholder="Asset Name"
			width="257px"
			text="Filter by Name"
		/>
		<div class="flex center" style="min-height:50px;">
			<CtaButton text="Reset Search" onClick={resetSearch} fontSize="14px" />
		</div>
	</div>

	<!-- 	<div class="showOnSale">
		<label class="container">
			<input type="checkbox">
			<span class="checkmark"></span>
		</label>
		
		<label for="showOnSale">Show only assets On Sale</label> 
	</div> -->

	<div class="grid">
		{#each data as nftData, i}
			<div>
				<AssetLookUpCard {nftData} bonus={false} craftedWith={false} />
			</div>
		{/each}
	</div>
	{#if dataLoaded && data.length == 0}
		<div class="no-assets flex center">No assets found!</div>
	{/if}
</div>
{#if !dataLoaded}
	<div style="margin-top:40px;margin-bottom:40px;">
		<LoaderDots />
	</div>
{:else if data.length > 20}
	<div class="loadmore">
		<CtaButton
			outlined
			text="Load more"
			fontSize="16px"
			onClick={() => {
				page++;
				loadOffersData();
			}}
		/>
	</div>
{/if}

<style>
	.showOnSale {
		margin-top: 15px;
		display: flex;
	}
	.showOnSale .container {
		margin-right: 15px;
	}
	.container {
		display: block;
		position: relative;
		padding-left: 35px;
		margin-bottom: 12px;
		cursor: pointer;
		font-size: 22px;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	/* Hide the browser's default checkbox */
	.container input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	/* Create a custom checkbox */
	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 25px;
		width: 25px;
		background-color: transparent;
		border: 1px solid #36ffc0;
	}
	/* Create the checkmark/indicator (hidden when not checked) */
	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}

	/* Show the checkmark when checked */
	.container input:checked ~ .checkmark:after {
		display: block;
	}

	/* Style the checkmark/indicator */
	.container .checkmark:after {
		left: 6px;
		top: 2px;
		width: 10px;
		height: 15px;
		border: solid #36ffc0;
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		transform: rotate(45deg);
	}
	.mobileFilters {
		display: none;
		margin-top: 15px;
	}

	.mobileFilters .btnFilters {
		margin-right: 15px;
	}
	.btnInventory,
	.btnFilters {
		padding: 5px 10px;
		border: 1px solid #36ffc0;
		background: transparent;
		color: white;
		cursor: pointer;
		width: max-content;
		display: flex;
		font-size: 23px;
		font-weight: 800;
		align-items: center;
		padding: 5px 25px 5px 15px;
	}
	.btnInventory {
		margin-bottom: 20px;
		font-size: 16px;
	}

	.btnInventory:hover,
	.btnFilters:hover {
		border: 1px solid #36ffc0;
		background: #36ffc0;
	}
	.btnInventory img {
		height: 32px;
	}
	.loadmore {
		display: flex;
		margin: 30px;
		justify-content: center;
		align-items: center;
	}
	h1 {
		font-family: Lato;

		font-size: 46px;

		font-weight: 900;

		font-stretch: normal;

		font-style: normal;

		line-height: normal;

		letter-spacing: normal;

		text-align: left;

		color: #fff;
	}
	.filters {
		margin-top: 64px;

		display: flex;
		flex-direction: row;
	}
	.wrapper {
		max-width: 1264px;
		width: 100%;
		margin: 0 auto;
		color: white;
	}
	.grid {
		overflow-y: inherit;
		margin: 0 auto;
		margin-top: 28px;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(135px, 405px));
		gap: 24px;
		justify-content: center;
		padding: 20px 0;
	}

	@-webkit-keyframes -global-scale-in-center {
		0% {
			-webkit-transform: scale(0.3);
			transform: scale(0.3);
			opacity: 1;
		}
		100% {
			-webkit-transform: scale(1);
			transform: scale(1);
			opacity: 1;
		}
	}
	@keyframes -global-scale-in-center {
		0% {
			-webkit-transform: scale(0.3);
			transform: scale(0.3);
			opacity: 1;
		}
		100% {
			-webkit-transform: scale(1);
			transform: scale(1);
			opacity: 1;
		}
	}
	@media only screen and (max-width: 1100px) {
		.btnInventory {
			margin-top: 50px;
		}
		.btnInventory,
		.btnFilters,
		h1.title,
		h2.subtitle,
		.showOnSale {
			margin-left: 15px;
		}
	}
	@media only screen and (max-width: 800px) {
		.mobileFilters {
			display: flex;
		}
		.filters {
			display: none;
		}
	}
	@media only screen and (max-width: 500px) {
		.grid {
			justify-items: center;
			grid-template-columns: repeat(auto-fit, minmax(135px, 100%));
		}
	}
</style>
