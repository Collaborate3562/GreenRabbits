<script>
	import { craftingStepFigure } from 'src/stores/store';

	import ScreenOne from './ScreenOne.svelte';
	import ScreenThree from './ScreenThree.svelte';
	import ScreenTwo from './ScreenTwo.svelte';
	export let stepOneClick;
	export let stepTwoClick;
	export let stepThreeClick;
	export let cancel;
	export let abandon;
</script>

<div class="wrapper">
	<h1>Greenprint Crafting</h1>

	<div class="content">
		{#if $craftingStepFigure === 1}
			<ScreenOne {stepOneClick} {cancel} />
		{:else if $craftingStepFigure === 2}
			<ScreenTwo {stepTwoClick} {abandon} />
		{:else if $craftingStepFigure === 3}
			<ScreenThree {stepThreeClick} {abandon} />
		{/if}
	</div>
</div>

<style>
	.wrapper {
		height: 100%;
		align-items: center;
	}
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 350px;
	}

	h1 {
		font-size: 28px;
		font-weight: 600;
	}
</style>
