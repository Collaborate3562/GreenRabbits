<script>
	import CtaButton from '../CTAButton.svelte';
	import Cookies from 'js-cookie';
	import { cookieStatus } from 'src/stores/store';

	function acceptCookie() {
		Cookies.set('policyAccepted', 'true', { expires: 30 });
		$cookieStatus = true;
	}
</script>

<div class="cookie-wrapper">
	<p>
		This website uses cookies to ensure you get the best experience on our website. Please read our{' '}
		<a target="_blank" href="https://greenrabbitgame.io/privacy-policy" class="privacy-policy"
			>Privacy Policy.</a
		>
	</p>
	<div class="btn">
		<CtaButton fontSize="16px" text="continue" onClick={() => acceptCookie()} link={null} />
	</div>
</div>

<style>
	.cookie-wrapper {
		z-index: 99999;
		position: fixed;
		display: flex;
		flex-direction: column;
		height: 150px;
		width: 100vw;

		background-color: #000;
		border: 2px solid #1d1d1d;
		bottom: 0;
		color: #fff;
	}
	.btn {
		display: flex;
		justify-content: flex-end;
		padding-right: 20px;
	}
	p {
		padding: 12px;
		padding-right: 24px;
	}
	@media (min-width: 900px) and (min-height: 900px) {
		.btn {
			position: relative;
			display: flex;
			justify-content: center;
		}
		.privacy-policy {
			text-decoration: underline;
		}
		p {
			padding: 0;
		}
		.cookie-wrapper {
			z-index: 99999;
			position: fixed;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			left: 75px;
			bottom: 75px;
			height: 130px;
			width: 450px;
			background-color: #000;
			border: 2px solid #1d1d1d;
			border-radius: 3px;
			padding: 12px;
			color: white;
		}
	}
</style>
