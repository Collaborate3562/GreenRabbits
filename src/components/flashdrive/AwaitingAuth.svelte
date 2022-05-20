<script>
	import { isDataLoading } from 'src/stores/store';
</script>

<div class="wrapper">
	<img src="/game_assets/greentooth.png" alt="greentooth logo" />
	{#if !$isDataLoading}
		<h1>Awaiting Confirmation</h1>
		<h2>Please sign the transaction in your wallet</h2>
	{:else}
		<h1>Transaction Successful</h1>
		<h2>Refreshing data...</h2>
	{/if}
</div>

<style>
	img {
		-webkit-animation: square-spin 3s 0s cubic-bezier(0.09, 0.3, 0.6, 0.9) infinite;
		animation: square-spin 3s 0s cubic-bezier(0.09, 0.3, 0.6, 0.9) infinite;
	}
	h1 {
		margin-top: 26px;
		font-size: 24px;
		font-weight: bold;
		text-align: center;
	}
	h2 {
		margin-top: 12px;
		opacity: 0.7;

		font-size: 18px;

		font-weight: normal;
		text-align: center;
	}
	.wrapper {
		min-height: 480px;
		min-width: 730px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	@media (max-width: 1024px) {
		.wrapper {
			min-width: 100%;
		}
	}
</style>
