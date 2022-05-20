<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	let isOpen = false;
	let thisDropdown;

	export let filterItems = [];
	export let selected = filterItems[0];
	export let width;
	export let text;
	export let margin = '0 8px 0 0';
	export let onChange = () => {};
	function setIsOpen() {
		isOpen = !isOpen;
	}

	function setItem(item) {
		selected = item;
		onChange();
	}

	onMount(() => {
		document.addEventListener('click', function (event) {
			if (thisDropdown) {
				var isClickInside = thisDropdown.contains(event.target);
				if (!isClickInside) {
					isOpen = false;
				}
			}
		});
	});
</script>

<div
	class="wrapper"
	bind:this={thisDropdown}
	style="--width:{width}; --margin:{margin};"
	on:click={setIsOpen}
>
	{#if text}<p class="filter-name">{text}</p>{/if}
	{selected ? selected.name : 'Choose'}
	<svg
		class={isOpen && 'arrow-closed'}
		width="14px"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 12.786 7.15"
	>
		<defs />
		<path fill="#fff" d="M0 7.15h12.786L6.226 0z" />
	</svg>
	{#if isOpen}
		<div transition:slide|local class="dropdown {isOpen && 'open'}">
			{#each filterItems as filterItem, idx}
				<div class="item" on:click={() => setItem(filterItem)}>{filterItem.name}</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	svg {
		transform: rotate(180deg);
		transition: transform 0.2s;
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

	.arrow-closed {
		transform: rotate(0deg);
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
		z-index: 9999;
		position: absolute;
		top: 48px;
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
		max-height: 340px;
		overflow-y: auto;
	}
	@media (max-width: 768px) {
		.wrapper {
			width: 150px;
		}
	}
</style>
