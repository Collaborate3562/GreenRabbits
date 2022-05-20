<script>
	import CtaButton from 'src/components/CTAButton.svelte';
	import { waitingConfirmationCrafting } from 'src/stores/store';
	export let stepOneClick;
	export let cancel;

	let innerWidth;
</script>

<svelte:window bind:innerWidth />

<div class="wrapper">
	<div class="step">
		<div class="circle current">1</div>
		<div class="line" />
		<div class="circle next">2</div>
		<div class="line" />
		<div class="circle next">3</div>
	</div>
	<p>You're ready to initiate the Greenprint crafting</p>
	<div class="buttons">
		<CtaButton
			text="cancel craft"
			onClick={cancel}
			outlined
			width={innerWidth < 1024 ? '215px' : '190px'}
			fontSize="16px"
		/>
		<CtaButton
			loading={$waitingConfirmationCrafting}
			onClick={stepOneClick}
			text="initiate crafting"
			width="215px"
			fontSize="16px"
			margin={innerWidth < 1024 ? '0 0 12px 0' : undefined}
		/>
	</div>
</div>

<style>
	.buttons {
		display: flex;
		flex-direction: column-reverse;
	}
	.wrapper {
		height: 235px;
		width: 250px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}
	p {
		font-size: 20px;
		font-weight: 600;
		text-align: center;
	}

	.step {
		width: 250px;
		display: flex;
		align-items: center;
	}

	.next {
		background-color: #696969;
	}
	.current {
		background-color: var(--primary-teal);
	}
	.circle {
		width: 41px;
		height: 41px;
		color: #000;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50px;
		font-weight: 900;
	}

	.line {
		background-color: #696969;
		height: 1px;
		width: 65px;
	}

	@media (min-width: 1024px) {
		.buttons {
			justify-content: space-between;
			display: flex;
			width: 425px;
			flex-direction: row;
		}
	}
</style>
