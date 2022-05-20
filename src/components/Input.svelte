<script>
	import { onMount } from 'svelte';

	let thisDropdown;

	export let value;
	export let width;
	export let text;
	export let margin = '0 8px 0 0';
	export let type = 'text';
	export let placeholder = 'NFT Name';
</script>

<div class="wrapper" bind:this={thisDropdown} style="--width:{width}; --margin:{margin};">
	<p class="filter-name">{text}</p>
	<div class="search-icon" />
	<input type="text" {placeholder} bind:value />
</div>

<style>
	input {
		background: black;
		color: white;
	}
	input[type='number'] {
		-moz-appearance: textfield;
	}
	input:focus-visible {
		outline: none;
	}
	.wrapper {
		position: relative;
		justify-content: space-between;
		display: flex;
		align-items: center;
		width: calc(var(--width));
		height: calc(50px);
		border: 1px solid var(--primary-teal);
		padding: 14px;
		margin: var(--margin);
	}
	.search-icon {
		width: 50px;
		height: 50px;
		background: url('/assets/search.svg');
		background-position: center;
		background-repeat: no-repeat;
	}

	.arrow-closed {
		transform: rotate(180deg);
	}

	.wrapper .filter-name {
		position: absolute;
		font-size: 16px;
		margin: 0;
		left: 0;
		top: -30px;
	}

	.dropdown {
		display: none;
		z-index: 11;
		position: absolute;
		top: 52px;
		left: 0;

		width: 100%;

		background-color: #000;
		border: 1px solid var(--primary-teal);
	}
	.item {
		height: calc(50px);
		padding: 12px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		cursor: pointer;
		white-space: nowrap;
	}
	.item:hover {
		background-color: var(--greenish-cyan);
	}
	.open {
		display: block;
	}
</style>
