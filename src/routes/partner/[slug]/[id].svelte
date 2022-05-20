<script>
	import { page } from '$app/stores';
	import Staking from 'src/components/staking/Staking.svelte';
	import { partnerDrives } from 'src/stores/store';
	import { partners } from 'src/utils/partners';

	let id = $page.params.id;
	let slug = $page.params.slug;
	$: {
		if ($partnerDrives[slug]) {
			console.log('id is ', id, $partnerDrives[slug]?.filter((e) => e.asset_id == id)[0]);
		}
	}
	$: drive = $partnerDrives[slug]?.filter((e) => e.asset_id == id)[0];
	$: partner = partners.filter((e) => e.slug == slug)[0];
</script>

{#if drive}
	<Staking {drive} {partner} />
{/if}
