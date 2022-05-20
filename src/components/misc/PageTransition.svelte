<!-- PageTransition.svelte -->
<script>
	import { page } from '$app/stores';
	import { lastPage, slideLeft } from 'src/stores/store';

	import { fly } from 'svelte/transition';
	export let refresh = '';
	let pageBefore = $page.path;
	let lastPageVar = $page.path;
	let In = 300;
	let Out = -300;

	$: {
		if ($page.path != lastPageVar) {
			$lastPage = lastPageVar;
			lastPageVar = $page.path;
		}
	}
</script>

{#key refresh}
	<div
		in:fly={{ x: $slideLeft ? -300 : 300, duration: 200, delay: 200 }}
		out:fly={{ x: $slideLeft ? 300 : -300, duration: 200 }}
	>
		<slot />
	</div>
{/key}
