<script>
	import { salesStore } from 'src/stores/store';
	import { fade } from 'svelte/transition';
	import StoreCard from './StoreCard.svelte';
</script>

<svelte:head>
	<title>Store | GreenRabbit Game</title>
</svelte:head>

<div in:fade={{ duration: 200, delay: 250 }} class="wrapper">
	<div class="store-items">
		<h1>The Shell Road</h1>
		{#if $salesStore && $salesStore.length && $salesStore.filter((nftData) => nftData.show).length}
			{#each $salesStore as nftData, i}
				{#if nftData.show}
					<div in:fade={{ duration: 100, delay: 80 * i + 250 }}>
						<StoreCard {nftData} />
					</div>
				{/if}
			{/each}
		{:else}
			<div id="coming-soon">
				<h1 style="font-size: 48px; font-weight:900;">Coming soon!</h1>
				<p>We are preparing the store items, check back in a little while.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	#coming-soon h1 {
		position: relative;
	}

	#coming-soon {
		margin-top: 78px;
	}
	.wrapper {
		color: white;
		padding: 8px;
		max-width: 1096px;
		margin: 0 auto;
		margin-top: 56px;
	}

	.wrapper .store-items h1 {
		font-size: 28px;
		font-weight: 900;
		position: absolute;
		top: calc(0px - 64px);
		left: 0;
	}

	.store-items {
		width: 100%;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(168px, max-content));
		grid-gap: 6px;
		justify-content: center;
		padding: initial;
	}

	@media (min-width: 768px) {
		.store-items {
			grid-template-columns: repeat(auto-fit, minmax(264px, max-content));
			grid-gap: 8px;
		}
	}

	@media (max-width: 1100px) and (min-width: 768px) {
		.wrapper .store-items h1 {
			margin-left: 120px;
		}
	}
</style>
