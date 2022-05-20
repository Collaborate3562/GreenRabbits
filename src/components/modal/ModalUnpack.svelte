<script>
	import LoadingSpinner from '../LoadingSpinner.svelte';

	export let disabled = false;
	export let width = '250';
	export let onClick;
	export let loading = false;
</script>

<button style="--width:{width}px" on:click={onClick} class:disabled
	>{#if loading}<LoadingSpinner width="25" height="25" />{:else}UNPACK{/if}</button
>

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
		margin: 0 auto 0 0;
		padding: 14px;
		height: 45px;
		width: var(--width);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		margin-bottom: 24px;
		font-size: 14px;
		border: solid 1px var(--primary-teal);
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
