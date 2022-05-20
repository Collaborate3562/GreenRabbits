<script>
	import { now } from 'src/stores/store';

	import StartTimerLite from '../StartTimerLite.svelte';

	export let disabled = false;
	export let onClick;
	export let text;
	export let isTimer = false;
	export let startTime;

	$: saleStarted = startTime < $now;
</script>

<button class:disabled on:click={onClick}>
	{#if isTimer && !saleStarted}
		<StartTimerLite start={startTime} />
	{:else}
		<p>{text || 'VIEW SALE'}</p>
	{/if}
</button>

<style>
	button {
		/* REMOVE DEFAULT STYLE */
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;

		/* NEW STYLE */

		height: 45px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		white-space: nowrap;

		font-size: 14px;
		font-weight: 900;
		border: solid 1px #36ffc0;
		margin: 0 auto;

		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	@media (min-width: 768px) {
		button {
		}
	}

	@media (min-width: 1024px) {
		button {
			width: 193px;
		}
	}
</style>
