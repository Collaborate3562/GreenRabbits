<script>
	import ComponentCrafting from 'src/components/greenprint/crafting/ComponentCrafting.svelte';
	import GpCrafting from 'src/components/greenprint/crafting/GPCrafting.svelte';
	import GreenPrintInventory from 'src/components/greenprint/overlays/GreenPrintInventory.svelte';
	import ResetCrafting from 'src/components/greenprint/overlays/ResetCrafting.svelte';
	import ErrorPage from 'src/components/misc/ErrorPage.svelte';
	import NotSimpleModal from 'src/components/modals/NotSimpleModal.svelte';
	import PromoStaking from 'src/components/promostaking/PromoStaking.svelte';
	import { activeUser, allAssetsStore } from 'src/stores/store';
	import { getContext } from 'svelte';

	const { open, close } = getContext('simple-modal');
</script>

<!-- <div class="wrapper"> -->
<!-- <PromoStaking /> -->
<!-- <button
		on:click={() => {
			showGreenprintInventory = !showGreenprintInventory;
		}}>SHOW ME!</button
	>

	<GreenPrintInventory {allAssetsStore} bind:showGreenprintInventory />
</div>  -->

<!-- <ErrorPage /> -->

<!-- <GreenPrintInventory {allAssetsStore} bind:showGreenprintInventory /> -->
<style>
	.wrapper {
		width: 100%;
		margin: 0 auto;
		color: white;
	}
	button {
		margin-top: 133.7px;
	}
</style>
