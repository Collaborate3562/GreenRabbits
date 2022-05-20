<script>
	import { fly } from 'svelte/transition';
	export let showVersionPopup = null;
	export let showCommitPopup = null;
	import CtaButton from '../CTAButton.svelte';
</script>

<div class="wrapper" in:fly={{ x: 200, duration: 300 }}>
	<div class="content">
		<div class="title">Update is available!</div>
		{#if showVersionPopup}
			<div class="sub">Version {showVersionPopup} of Green Rabbit Game is available.</div>
		{/if}
		{#if showCommitPopup}
			<div class="sub">Latest build of Green Rabbit Game is available.</div>
		{/if}
		<div class="sub">Refresh the page to update the game!</div>
		<div class="buttonwrap">
			<CtaButton
				width="198px"
				fontSize="14px"
				text="REFRESH AND UPDATE"
				onClick={() => {
					window.location.reload();
				}}
			/>
		</div>
	</div>
</div>

<style>
	.buttonwrap {
		margin-top: 36px;
		margin-bottom: 47px;
	}
	.title {
		font-size: 24px;

		font-weight: 900;

		font-stretch: normal;

		font-style: normal;

		line-height: normal;

		letter-spacing: normal;

		text-align: center;

		color: #fff;
		margin-top: 68px;
		margin-bottom: 11px;
	}

	.sub {
		margin-top: 11px;
		margin-bottom: 11px;
		font-size: 16px;

		font-weight: normal;

		font-stretch: normal;

		font-style: normal;

		line-height: normal;

		letter-spacing: normal;

		text-align: center;

		color: #fff;
		width: 80%;
	}

	.wrapper {
		position: absolute;
		top: 124px;
		right: 0px;
		width: 100vw;

		height: 317px;
		border: none;
		border-top: solid 3px #36ffc0;
		border-bottom: solid 3px #36ffc0;
		z-index: 2;
		background-color: black;
	}
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	@media (min-width: 1024px) {
		.wrapper {
			position: absolute;
			top: 129px;
			right: 14px;
			width: 520px;

			height: 317px;
			border: solid 3px #36ffc0;
		}
	}
</style>
