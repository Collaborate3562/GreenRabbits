<script>
	import { page } from '$app/stores';
	import Staking from 'src/components/staking/Staking.svelte';
	import { dataLoaded, drivesStore } from 'src/stores/store';
	import { onMount } from 'svelte';
	let id = $page.params.slug;
	let drive;
	$: {
		if ($dataLoaded) {
			drive = $drivesStore.filter((drive) => String(drive.asset_id) == String(id))[0];
		}
	}
</script>

{#if $dataLoaded && drive}
	<Staking {drive} />
{/if}
