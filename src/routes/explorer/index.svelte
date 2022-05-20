<script>
	import AssetLookUp from 'src/components/explorer/AssetLookUp.svelte';
	import { dataLoaded } from 'src/stores/store';
</script>

{#if $dataLoaded}
	<AssetLookUp />
{/if}
