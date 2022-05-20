<script>
	import CtaButton from '../CTAButton.svelte';
	let messages = {
		404: 'Page not found',
		500: 'Internal server error'
	};
	export let status;
</script>

<div class="error-wrapper">
	<div class="content">
		<h1>
			<p class="rabbithole">Ups, you went too deep into the rabbit hole...</p>
			{status}
			<h2>{messages[status]}</h2>
		</h1>
		<CtaButton
			text="start from beginning"
			width="245px"
			height="45px"
			fontSize="16px"
			margin="80px auto 0"
			link="/hub"
		/>
	</div>

	<img class="gr-text-logo" alt="Green Rabbit Icon" src="/assets/gr-logo-text.png" />
</div>

<style>
	.content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}
	p.rabbithole {
		font-size: 20px;
		font-weight: 900;
		position: absolute;
		top: -65px;
		width: 275px;
		margin: 0 auto;
		text-align: center;
		left: 0;
		right: 0;
		margin: auto;
	}
	h1 {
		position: relative;
		font-size: 70px;
		width: 100%;
		text-align: center;
		top: 35px;
	}
	h2 {
		font-size: 20px;
		position: absolute;
		left: 0;
		right: 0;
		bottom: -10px;
		font-weight: 600;
	}
	.error-wrapper {
		color: #fff;
		margin-top: 109px;
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		height: 100vh;
		width: 100vw;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 50% 50%;
		background-image: url('https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629130337/GreenRabbit/mobile-error-bg.jpg');
	}
	.gr-text-logo {
		top: 0;
		left: 0;
		right: 0;
		margin: 34px auto 0;
		position: absolute;
		width: 250px;
		height: 33px;
	}
	@media (min-width: 768px) {
		.error-wrapper {
			background-position: 50% 50%;
			background-repeat: no-repeat;
			background-size: cover;
			background-image: radial-gradient(
					circle,
					rgba(0, 0, 0, 0.65) 22%,
					rgba(0, 0, 0, 0) 45%,
					rgba(0, 0, 0, 0) 55%,
					rgba(0, 0, 0, 0.1) 60%
				),
				url('https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629136001/GreenRabbit/error-bg-desktop.jpg');
		}

		p.rabbithole {
			font-size: 36px;
			width: 100%;
			top: -50px;
		}
		h1 {
			font-size: 130px;
		}
		h2 {
			font-size: 30px;
		}
		.gr-text-logo {
			margin-top: 75px;
			width: 363px;
			height: 48px;
		}
	}
</style>
