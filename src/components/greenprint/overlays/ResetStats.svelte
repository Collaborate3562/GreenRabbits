<script>
	import CtaButton from 'src/components/CTAButton.svelte';

	import { userBalance } from 'src/stores/store';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { getContext } from 'svelte';

	const { close } = getContext('simple-modal');

	export let onPay;
	export let amount;

	let insufficientSell;
	$: insufficientSell = $userBalance < amount;
</script>

<div class="wrapper">
	<h1>Reset stat points</h1>

	<div class="content">
		<div class="text">
			<p>Reset stat points for</p>
			<p class="currency">{toFixedCurrency(Number(amount), 2)} SHELL</p>
			{#if insufficientSell}
				<p class="insufficient">Insufficient Shellinium</p>
			{/if}
		</div>
		<div class="buttons">
			<CtaButton
				disabled={insufficientSell}
				onClick={onPay}
				text="PAY AND RESET"
				width="280px"
				fontSize="16px"
				margin="0 0 16px 0"
			/>
			<CtaButton onClick={close} text="CANCEL" outlined width="280px" fontSize="16px" />
		</div>
	</div>
</div>

<style>
	.wrapper {
		color: white;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	h1 {
		font-size: 22px;
		font-weight: 900;
		padding: 16px;
	}

	.content {
		padding: 14px;
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.text {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.buttons {
		display: flex;
		flex-direction: column;
		align-self: flex-end;
		align-items: center;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;

		margin-bottom: 30px;
	}

	.wrapper p {
		font-size: 22px;
	}

	.wrapper p.insufficient {
		color: var(--danger);
		font-size: 14px;
	}
	.currency {
		font-weight: 600;
		color: var(--primary-teal);
		margin-top: 10px;
	}

	@media (min-width: 1024px) {
		.text {
			position: relative;
			top: -50px;
		}
	}
</style>
