<script>
	import { browser } from '$app/env';
	import { now } from 'src/stores/store';

	import { onDestroy, onMount } from 'svelte';

	let timer;
	async function startTimer() {
		$now = Math.floor(Date.now() / 1000);
		timer = setInterval(() => {
			$now = Math.floor(Date.now() / 1000);
		}, 1000);

		/*

		// Testing Solstrus Maps

		// $now = 1639785600 - 20; // sol
		$now = 1640908800 - 20; // sol-special

		timer = setInterval(() => {
			$now += 1;
		}, 1000);

		*/
	}

	onMount(() => {
		if (browser) startTimer();
	});
	onDestroy(() => {
		clearInterval(timer);
	});
</script>
