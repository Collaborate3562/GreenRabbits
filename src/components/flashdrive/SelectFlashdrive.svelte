<script>
	import { collectionsStore, isDataLoading } from 'src/stores/store';
	import { driveAssetsStore } from 'src/stores/store';
	import LoadingSpinner from '../LoadingSpinner.svelte';
	import FlashdriveCard from './FlashdriveCard.svelte';
</script>

<div class="wrapper">
	<!-- <img src="/game_assets/greentooth.png" alt="greentooth logo" /> -->
	<h1>Select a Flashdrive</h1>
	<div class="innerContent">
		{#if $driveAssetsStore.filter((asset) => asset.data.Collection === 'greenrabbit').length}
			<div class="grid">
				{#each $driveAssetsStore.filter((asset) => asset.data.Collection === 'greenrabbit') as flashdrive, idx}
					<FlashdriveCard nftData={flashdrive} />
				{/each}
			</div>
		{:else}
			<div class="no__items">
				<span
					style="  font-size: 24px;

				font-weight: bold;">You don’t have any Flash Drives</span
				>
				<span
					style="  font-size: 18px;
				width:206px;text-align: center; margin-top:12px; opacity: 0.7;
				font-weight: normal;">Buy them on the market or get them from packs.</span
				>
			</div>
		{/if}
	</div>
</div>

<style>
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
</style>
