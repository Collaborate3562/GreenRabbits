<script>
	import CtaButton from '../CTAButton.svelte';

	export let showUnpackSuccess = true;

	function closeSuccessModal() {
		showUnpackSuccess = false;
	}
</script>

<div class="wrapper">
	<p>That was amazing! LFG! Epic cringe text</p>
	<CtaButton
		text="close"
		width="185px"
		fontSize="16px"
		margin="0 0 18px 0"
		onClick={closeSuccessModal}
	/>
	<CtaButton text="GO TO INVENTORY" width="185px" fontSize="16px" outlined />
</div>

<style>
	.wrapper {
		width: 280px;
		height: 300px;
		padding: 32px;
		border: 3px solid var(--primary-teal);
	}

	.wrapper p {
		font-size: 22px;
		font-weight: 900;
		text-align: center;
		margin-bottom: 42px;
	}

	@media (min-width: 1024px) {
		.wrapper {
			width: 560px;
			height: 350px;

			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
	}
</style>
