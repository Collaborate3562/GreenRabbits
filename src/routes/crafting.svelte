<script>
	import GpCrafting from 'src/components/greenprint/crafting/GPCrafting.svelte';

	import NotSimpleModal from 'src/components/modals/NotSimpleModal.svelte';
	import { inventoryOpen } from 'src/stores/store';
</script>

<svelte:head>
	<title>Greenprint Crafting | GreenRabbit Game</title>
</svelte:head>
<div class="wrapper">
	<NotSimpleModal
		on:closed={() => {
			$inventoryOpen = false;
		}}
	>
		<GpCrafting />
	</NotSimpleModal>

	<!-- <Footer /> -->
</div>

<style>
	.wrapper {
		padding-bottom: 250px;
		
	}
</style>
