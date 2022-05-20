<script>
	import { getContext } from 'svelte';
	import UnpackContent from './UnpackContent.svelte';
	export let nftData;
	export let disabled = false;
	const { open, close } = getContext('unpack-modal');

	function onClick() {
		open(UnpackContent, { nftData });
	}
</script>

<button class:disabled on:click={onClick}>UNPACK</button>

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
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	@media (min-width: 768px) {
	}

	@media (min-width: 1024px) {
		button {
			width: 193px;
			margin: 0;
		}
	}
</style>
