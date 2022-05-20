<script>
	import CtaButton from '../CTAButton.svelte';
	import { announcementSeen } from 'src/stores/store';

	function acceptCookie() {
		localStorage.setItem('announcementSeen', 'true');
		$announcementSeen = true;
	}
</script> 

<div class="accouncement-wrapper">
	<p>
		Our
		<a target="_blank" href="https://greenrabbitgame.io/terms-of-use" class="privacy-policy"
			>Terms of Service
		</a> has been updated.
	</p>
	<p class="subText">See the changes <a target="_blank" rel="noreferrer" href="/pdf-folder/ToS_Diff_07-2021-v-08-2021.pdf">here</a></p>
	<div class="btn">
		<CtaButton
			fontSize="16px"
			text="close"
			width="310px"
			onClick={() => acceptCookie()}
			link={null}
		/>
	</div>
</div>

<style>
	.subText {
		font-size: 0.9rem;
	}
	.subText a {
		color: #00ffbb;
		text-decoration: underline;
	}
	.accouncement-wrapper {
		z-index: 99999;
		position: fixed;
		display: flex;
		flex-direction: column;
		height: 150px;
		width: 100vw;
		text-align: center;
		background-color: #000;
		border: 2px solid #1d1d1d;
		bottom: 0;
		color: #fff;
	}
	.btn {
		display: flex;
		justify-content: center;
		cursor: pointer;
	}
	p {
		padding: 12px;
		padding-right: 24px;
	}
	@media (min-width: 900px) and (min-height: 900px) {
		.btn {
			position: relative;
			display: flex;
			justify-content: left;
		}
		.privacy-policy {
			text-decoration: underline;
		}
		p {
			padding: 0;
		}
		.accouncement-wrapper {
			z-index: 99999;
			position: fixed;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			right: 75px;
			bottom: 75px;
			height: 130px;
			width: 310px;
			background-color: #000;
			border: 2px solid #1d1d1d;
			border-radius: 3px;
			padding: 12px;
			color: white;
		}
	}
</style>
