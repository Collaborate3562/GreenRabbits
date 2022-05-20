<script>
	export let max;
	export let current;
	export let added;

	$: percent = (current * 100) / max;

	$: percentAdded = ((current + added) * 100) / max;
	$: width = 265 * (percent / 100);
	$: widthBonus = 265 * (percentAdded / 100);
</script>

<div class="rectangle" />
<div class="rectangle-progress-bonus" style="--percentage-added:{widthBonus}px" />
<div class="rectangle-progress" style="--percentage:{width}px" />

<style>
	.rectangle {
		width: 265px;
		height: 8px;
		background: #000000;
		border-radius: 4px;
	}
	.rectangle-progress {
		position: absolute;
		width: var(--percentage);
		transition: all 0.4s ease-in-out;
		height: 8px;
		background: #36ffc0;
		box-shadow: inset 0px 3px 0px rgba(253, 253, 253, 0.8);
		border-radius: 4px;
	}
	.rectangle-progress-bonus {
		position: absolute;
		width: var(--percentage-added);
		transition: all 0.4s ease-in-out;
		height: 8px;
		background: #ffeb36;
		box-shadow: inset 0px 3px 0px rgba(253, 253, 253, 0.8);
		border-radius: 4px;
	}
</style>
