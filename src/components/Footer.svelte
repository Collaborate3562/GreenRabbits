<script>
	import { env } from 'src/utils/variables';
	import { browser } from '$app/env';
	import { onDestroy, onMount } from 'svelte';
	import VersionPopup from './misc/VersionPopup.svelte';

	let showVersionPopup = null;
	let showCommitPopup = null;
	let timer;

	async function checkForNewVersion() {
		const data = await fetch('/version');
		const versionData = await data.json();
		if (versionData.version != env.version) {
			showVersionPopup = versionData.version;
			clearInterval(timer);
			return;
		}
		if (versionData.commit != env.commit) {
			showCommitPopup = versionData.commit;
			clearInterval(timer);
			return;
		}
	}
	async function startTimer() {
		timer = setInterval(() => {
			checkForNewVersion();
		}, 15000);
	}

	onMount(() => {
		if (browser) startTimer();
	});
	onDestroy(() => {
		clearInterval(timer);
	});
</script>

{#if showVersionPopup}
	<VersionPopup {showVersionPopup} />
{/if}
{#if showCommitPopup}
	<VersionPopup {showCommitPopup} />
{/if}
<div class="footer">
	<div class="right">
		<div class="link">
			<a href="https://www.greenrabbitgame.io/privacy-policy" target="_blank">PRIVACY</a>
			<div class="divider" />
			<a href="https://www.greenrabbitgame.io/terms-of-use" target="_blank">TERMS OF USE</a>
			<div class="divider" />
			<a href="https://discord.gg/5fvKZSDNKt" target="_blank">DISCORD</a>
		</div>
		<div class="main-site">
			<a href="https://www.greenrabbitgame.io" target="_blank">WWW.GREENRABBITGAME.IO</a>
		</div>
		<div class="version">v{env.version}-{env.commit}</div>
	</div>
	<div class="company-info">
		<span>
			©{new Date().getFullYear()} GREEN RABBIT HOLDINGS, LLC - All rights reserved
		</span>
		<span> All trademarks referenced herein are the properties of their respective owners </span>
	</div>
</div>

<style>
	.footer {
		display: flex;
		flex-direction: row-reverse;
		justify-content: space-between;
		background-color: #171717;
		color: white;
		padding: 15px 20px;
		font-size: 12px;
	}
	.company-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.right {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.main-site,
	.version {
		margin-left: 35px;
	}
	.right .link {
		display: flex;
		height: max-content;
	}
	.right .link a {
		padding: 0 15px;
		border-right: 1px solid;
	}
	@media only screen and (max-width: 1100px) {
		.footer {
			flex-direction: column;
			align-items: center;
		}
		.right {
			flex-direction: column;
		}
		.main-site,
		.version {
			margin-left: 0;
		}
		.main-site {
			margin: 15px 0 30px 0;
		}
	}
	@media only screen and (max-width: 400px) {
		.right .link {
			font-size: 10px;
		}
		.right .link a {
			padding: 0 5px;
		}
	}
</style>
