<script>
	import { tokens } from 'src/utils/constants';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import CtaButton from './CTAButton.svelte';
	export let refreshChests;
	export let rewards = [];
</script>

<div class="ModalTitle">Congratulations!</div>
<div class="ModalContent">
	<div class="ModalSubtitle">
		<p>You’ve just redeemed</p>
		{#each rewards as reward}
			<span>{toFixedCurrency(reward.amount, 2)} {tokens[reward.name]}</span>
		{/each}
	</div>
	<img
		src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/v1627286021/GreenRabbit/shell_redeem_no_chest.png"
		alt="Shellinium chests"
		class="Img"
	/>
</div>
<div class="ButtonWrapper">
	<div>
		<CtaButton
			height="45px"
			width="180px"
			onClick={() => {
				refreshChests(false);
			}}
			fontSize="20px"
			text="GREAT!"
		/>
	</div>
</div>

<style>
	.ModalTitle {
		font-size: 28px;
		font-weight: bold;
		color: #ffffff;
		padding: 28px 42px 0px 42px;

		text-align: center;
	}

	.ModalContent {
		max-height: 529px;
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
		padding: 0 40px;
		text-align: center;
	}

	.ButtonWrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
	.ModalSubtitle {
		font-size: 18px;
		padding-bottom: 36px;
		font-weight: normal;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.ModalSubtitle span {
		color: var(--primary-teal);
	}

	.Img {
		position: absolute;
		bottom: 0;
		height: 90px;
		left: 0;
		right: 0;
		margin: 0 auto;
	}
	/* @media screen and (max-width: 1067px) {
   
  }
@media (max-width: 1100px) {
   
  }
  @media screen and (max-width: 790px) {
  
  } */
	@media (max-width: 400px) {
		.ModalContent {
			padding: 0;
		}
	}
	@media (max-height: 650px) {
		.ModalContent {
			max-height: 70vh;
		}
	}
</style>
