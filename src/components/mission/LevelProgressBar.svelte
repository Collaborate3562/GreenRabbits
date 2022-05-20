<script>
	export let percent = 0;
	$: percentCalc = percent > 100 ? 100 : percent;
	$: maxw = innerWidth > 768 ? 433 : 210;
	$: width = maxw * (percentCalc / 100);
	let innerWidth;
</script>

<svelte:window bind:innerWidth />
<div class="rectangle" style="--maxw:{maxw}px" />
<div class="rectangle-progress" style="--percentage:{width}px" />

<style>
	.rectangle {
		position: absolute;
		width: var(--maxw);
		height: 19px;
		transform: skew(-45deg);
		background: #353535;
		box-shadow: inset 0px 6px 0px rgba(255, 255, 255, 0.1);
	}
	.rectangle-progress {
		position: absolute;
		width: var(--percentage);
		transition: all 0.4s ease-in-out;
		height: 19px;
		transform: skew(-45deg);
		background: #36ffc0;
		box-shadow: inset 0px 6px 0px rgba(255, 255, 255, 0.5);
	}
</style>
