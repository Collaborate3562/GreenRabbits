<script>
	export let text;
</script>

<div class="_tooltip">
	<slot />
	<span class="tooltiptext">
		<h1>{text.title}</h1>
		<p>{text.text}</p>
	</span>
</div>

<style>
	h1 {
		font-size: 22px;
		font-weight: 900;
	}
	._tooltip {
		position: relative;
		display: inline-block;

		width: 20px;
		height: 20px;
		position: absolute;
		top: 4px;
		right: -30px;
		left: unset;
	}

	._tooltip .tooltiptext {
		visibility: hidden;
		width: 350px;
		background-color: #fff;
		color: #000;
		text-align: left;
		border-radius: 2px;
		padding: 15px;
		position: absolute;
		z-index: 1;
		bottom: 150%;
		right: -165px;
		margin-left: -60px;
	}

	._tooltip .tooltiptext::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -10px;
		border-width: 10px;
		border-style: solid;
		border-color: white transparent transparent transparent;
	}

	._tooltip:hover .tooltiptext {
		visibility: visible;
	}
	@media (max-width: 1024px) {
		.tooltiptext {
			display: none;
		}
	}
</style>
