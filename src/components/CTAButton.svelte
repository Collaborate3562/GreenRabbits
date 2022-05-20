<script>
	import LoadingSpinner from './LoadingSpinner.svelte';

	// This is default props right? You can pass in new values from parent?
	export let text = 'Click me!';
	export let outlined = false;
	export let disabled = false;
	export let link = '#';
	export let fontSize = '24px';
	export let onClick;
	export let height = '45px';
	export let width = '180px';
	export let margin = '0';
	export let loading = false;
	export let boosting = false;
</script>

<a
	href={link}
	on:click={onClick}
	style="--width:{width}; --height:{height}; --font-size: {fontSize}; --margin:{margin}"
	class:outlined
	class:disabled
	class="unselectable"
	>{#if loading}<LoadingSpinner height="25" width="25" />{:else}{text}{/if}</a
>

<style>
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		width: var(--width);
		height: var(--height);
		font-size: var(--font-size);
		font-weight: 600;
		padding: 0 6px;
		margin: var(--margin);
		color: white;
		text-transform: uppercase;
		text-decoration: none;
		text-align: center;
		white-space: nowrap;
		border: solid 2px #36ffc0;
		background: linear-gradient(to right, #44be98 100%, #20906d 100%);
	}

	.outlined {
		background: none;
		border-width: 2px;
	}

	.disabled {
		background: #387562;
		border: solid 2px #319576;
		pointer-events: none;
	}

	.outlined:hover,
	a:hover {
		background: linear-gradient(to right, #58d6af 3%, #46c19b 84%);
	}
</style>
