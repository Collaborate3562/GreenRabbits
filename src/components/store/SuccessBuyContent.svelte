<script>
	import ModalClose from '../modal/ModalClose.svelte';
	import ModalUnpack from '../modal/ModalUnpack.svelte';
</script>

<div class="successful-purchase">
	<img
		width="150"
		height="115"
		alt="Success logo"
		src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/v1628777346/GreenRabbit/success_buy.png"
	/>

	<p>Fanstastic!</p>
	<p class="success-product">
		You've just bought
		<span>Product name lore ispum</span>
	</p>
	<div class="buttons">
		<ModalUnpack />
		<ModalClose />
	</div>
</div>

<style>
	.successful-purchase {
		display: flex;
		flex-direction: column;
		align-items: center;

		padding: 40px;
	}
	.successful-purchase img {
		margin-top: 30px;
	}

	.successful-purchase p {
		margin-top: 40px;
		font-size: 28px;
		text-align: center;
	}
	.successful-purchase p.success-product {
		margin-top: 20px;
		margin-bottom: 100px;
		font-size: 18px;
		display: block;
	}

	.successful-purchase p.success-product span {
		font-weight: 900;
	}

	@media (min-width: 1024px) {
		.successful-purchase {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 0 40px;
		}
		.successful-purchase img {
			margin: 0;
		}

		.successful-purchase p {
			margin-top: 32px;
			font-size: 28px;
			text-align: center;
		}
		.successful-purchase p.success-product {
			margin-top: 20px;
			margin-bottom: 58px;
			font-size: 18px;
			display: block;
		}

		.successful-purchase p.success-product span {
			font-weight: 900;
		}
	}
</style>
