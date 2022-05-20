<script>
	import { browser } from '$app/env';

	import { page } from '$app/stores';

	import { activeUser, partnerDrives } from 'src/stores/store';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import { partners } from 'src/utils/partners';
	import { onMount } from 'svelte';
	let slug = $page.params.slug;
	let partner = partners.filter((e) => e.slug == slug)[0];

	async function getDrives() {
		const data = await greenRabbitApi.fetchDrivesFromCollection(
			$activeUser,
			partner.collectionName
		);
		/* 	console.log('DATA', partner.collectionName, partner, data); */
		$partnerDrives[slug] = data;
	}

	onMount(() => {
		if (browser) {
			if (!$partnerDrives[slug]) {
				getDrives();
			}
			window.getDrives = getDrives;
		}
	});
</script>

<slot />
