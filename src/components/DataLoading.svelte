<script>
	import { loadingString } from 'src/stores/store';

	import { fade, fly, slide } from 'svelte/transition';

	import LoadingSpinner from './LoadingSpinner.svelte';
	let text_width = 0;
	$: {
		if ($loadingString == 'done') text_width = 0;
	}
</script>

<div
	class="wrapper"
	style="--text_width:{text_width ? text_width + 4 + 5 + 20 + 35 + 10 : 35 + 10}px"
>
	{#if $loadingString != 'done'}
		<div class="text" bind:clientWidth={text_width}>
			<div class="loading-text">
				{$loadingString}
			</div>
		</div>
	{/if}

	<LoadingSpinner width="35" height="35" />
</div>

<style>
	.wrapper {
		z-index: 99999999;
		position: fixed;
		bottom: 40px;
		right: 40px;
		display: flex;
		align-items: center;
		border: 1px solid #36ffbf57;
		border-radius: 10px;
		padding: 4px;
		margin-left: 5px;
		justify-content: end;
		width: var(--text_width);
		transition: width 0.3s;
		height: 45px;
		background: black;
	}
	.loading-text {
		color: white;
		min-width: 170px;
	}
	.text {
		margin-right: 10px;
		margin-left: 10px;
		font-size: 14px;
		text-align: center;
	}
</style>
