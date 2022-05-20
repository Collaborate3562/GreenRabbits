<script>
	import InventoryCard from 'src/components/inventory/InventoryCard.svelte';
	import { allAssetsStore, dataLoaded } from 'src/stores/store';
	import Saos from 'saos';
	import InfiniteScroll from 'src/components/misc/InfiniteScroll.svelte';
	import { onMount } from 'svelte';
	import FilterDropdown from 'src/components/FilterDropdown.svelte';
	import GreenprintCard from 'src/components/greenprint/GreenprintCard.svelte';
	import NewInventoryCard from 'src/components/greenprint/NewInventoryCard.svelte';
	import Input from 'src/components/Input.svelte';

	import CtaButton from 'src/components/CTAButton.svelte';
	import { goto } from '$app/navigation';
	let data = [];
	let newBatch = [];
	let page = 0;
	let perPage = 20;
	function included(nft, filter) {
		return nft.name.toLowerCase().includes(filter);
	}

	async function fetchData(filter) {
		if (filter) {
			var filteredData = $allAssetsStore.filter((e) => {
				included(e, filter);
			});
			var response = filteredData.slice(page * perPage, (page + 1) * perPage);

			newBatch = response;
		} else {
			var response = $allAssetsStore.slice(page * perPage, (page + 1) * perPage);
			newBatch = response;
		}
	}
	let firstLoad = true;
	$: {
		if (firstLoad) {
			if ($dataLoaded) {
				fetchData();
				firstLoad = false;
			}
		}
	}

	$: data = [...data, ...newBatch];
	let nameFilter = '';
	let workingNameFilter = '';
	$: {
		if (nameFilter.length > 2) {
			let data = [];

			let page = 0;
			let perPage = 10;
			workingNameFilter = nameFilter.toLowerCase();
			fetchData(workingNameFilter);
		} else {
			workingNameFilter = '';
			let data = [];

			let page = 0;
			let perPage = 10;
			fetchData();
		}
	}
	let typeFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'T420 Art Diorama', id: 2, matcher: 'Diorama' },
		{ name: 'T420 Art Action', id: 3, matcher: 'Action' },
		{ name: 'T420 Art Coin', id: 4, matcher: 'Coin' },
		{ name: 'Lore Tablet', id: 5, matcher: 'Lore Tablet' },
		{ name: '3D Figure', id: 6, matcher: 'Figure' }
	];
	let selectedRarity, selectedSph, selectedType;
</script>

<svelte:head>
	<title>Inventory | GreenRabbit Game</title>
</svelte:head>
<div class="wrapper">
	<div class="flex-apart">
		<h1>Inventory</h1>
		<CtaButton
			text="GR ASSET LOOKUP"
			fontSize="14px"
			onClick={() => {
				goto('/explorer');
			}}
		/>
	</div>

	<!-- <div class="filters">
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Status"
			bind:selected={selectedType}
			filterItems={typeFilter}
		/>
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Type"
			bind:selected={selectedType}
			filterItems={typeFilter}
		/>
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Rarity"
			bind:selected={selectedType}
			filterItems={typeFilter}
		/>
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Totem"
			bind:selected={selectedType}
			filterItems={typeFilter}
		/>
		<FilterDropdown
			margin="0 17px 0 0 "
			width="180px"
			text="Sort by"
			bind:selected={selectedType}
			filterItems={typeFilter}
		/>
		<Input margin="0 17px 0 0 " bind:value={nameFilter} width="257px" text="Filter by name" />
	</div> -->

	<!-- <input type="text" bind:value={nameFilter} /> -->
	<div class="grid">
		{#each data as nftData}
			{#if nftData.name.toLowerCase().includes(workingNameFilter)}
				<!-- <Saos
					animation={'scale-in-center 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}
					animation_out={'scale-in-center 0.1s cubic-bezier(0.550, 0.085, 0.680, 0.530) reverse both'}
					top={150}
					bottom={150}
				> -->
				<div><NewInventoryCard {nftData} /></div>
				<!-- </Saos> -->
			{:else if workingNameFilter.length < 2}
				<!-- <Saos
					animation={'scale-in-center 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}
					animation_out={'scale-in-center 0.1s cubic-bezier(0.550, 0.085, 0.680, 0.530) reverse both'}
					top={150}
					bottom={150}
				> -->
				<div><NewInventoryCard {nftData} /></div>
				<!-- </Saos> -->
			{/if}
		{/each}
		<InfiniteScroll
			hasMore={data.length < $allAssetsStore.length}
			threshold={200}
			on:loadMore={() => {
				page++;
				fetchData();
			}}
		/>
	</div>
</div>

<style>
	.flex-apart {
		display: flex;
		justify-content: space-between;
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
		height: 80vh;
		overflow-y: auto;
		margin: 0 auto;
		margin-top: 28px;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(135px, 192px));
		gap: 13px;
		justify-content: center;
		padding: 20px 0;
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(auto-fit, minmax(135px, 192px));
			gap: 13px;
		}
	}

	/* ----------------------------------------------
 * Generated by Animista on 2021-8-17 2:6:34
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

	/**
 * ----------------------------------------
 * animation scale-in-center
 * ----------------------------------------
 */
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
</style>
