<script>
	export let selectedQuantity = 1;

	function decrement() {
		if (selectedQuantity - 1 < 1) return;
		selectedQuantity -= 1;
	}
	function increment() {
		if (selectedQuantity + 1 > max) return;
		selectedQuantity += 1;
	}
	export let max;
</script>

<div class="wrapper">
	<div on:click={() => decrement()} class="decrement">-</div>
	{selectedQuantity}
	<div on:click={() => increment()} class="increment">+</div>
</div>

<style>
	.wrapper {
		width: 133px;
		height: 44px;

		display: flex;
		justify-content: space-between;
		align-items: center;

		background-color: #fff;
		color: #000;

		-webkit-user-select: none; /* Safari */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none; /* IE10+/Edge */
		user-select: none; /* Standard */
	}

	.increment,
	.decrement {
		width: 44px;
		height: 44px;

		display: flex;
		justify-content: center;
		align-items: center;

		border: solid 1px #36ffc0;
		color: #fff;
		background-image: linear-gradient(to right, #44be98 3%, #20906d);

		cursor: pointer;
	}
</style>
