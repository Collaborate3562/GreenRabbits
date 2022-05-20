<script>
	import { getContext } from 'svelte';
	import ResetInventory from '../misc/ResetInventory.svelte';
	const { openInventory, closeInventory } = getContext('notsimple-modal');
	export let cooldown = 1;
</script>

<div
	class:disabled={cooldown == 0}
	class:active={cooldown}
	class="reset-icon unselectable"
	on:click={() => {
		if (cooldown)
			openInventory(ResetInventory, { showAll: true, selectedType: { matcher: 'All' } });
	}}
>
	<img src="/game_assets/reset.svg" width="23px" height="21px" alt="Reset" />
</div>

<style>
	.active {
		cursor: pointer;
	}
	.disabled {
		opacity: 0.3;
	}
	.reset-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 45px;
		height: 45px;
		margin-right: 20px;
		border: solid 1px var(--greenish-cyan);

		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}
</style>
