<script>
	import CtaButton from 'src/components/CTAButton.svelte';
	import { craftingLog, craftingResult, waitingConfirmationCrafting } from 'src/stores/store';
	import {
		AGILITY_MAX,
		INTELLECT_MAX,
		LUCK_MAX,
		RESILIENCE_MAX,
		SPEED_MAX,
		STRENGTH_MAX
	} from 'src/utils/constants';
	import { getContext, onMount } from 'svelte';
	const { open, close } = getContext('simple-modal');
	export let buildFailed = true;
	let refundedShell = true;
	let GSC = false;
	export let claimClick;
	const rarities = {
		uncommon: '#F2B47D',
		common: '#878787',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	const failUrls = {
		rabbit:
			'https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629575300/GreenRabbit/greenprint/failed-rabbit.png',
		snake:
			'https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629575300/GreenRabbit/greenprint/failed-snake.png',
		turtle:
			'https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629575300/GreenRabbit/greenprint/failed-turle.png',
		cat:
			'https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629575300/GreenRabbit/greenprint/failed-cat.png'
	};

	import { image, initialize } from 'svelte-cloudinary';
	initialize({ cloud_name: 'green-rabbit-holdings' });
	$: source = $craftingResult?.ipfs_hash;
	$: src = `GreenRabbit/nfts/${source}.png`;
	let strengthPercent = 0;
	let resiliencePercent = 0;
	let agilityPercent = 0;
	let speedPercent = 0;
	let intellectPercent = 0;
	let luckPercent = 0;

	$: {
		if (!buildFailed) {
			strengthPercent = (
				(Number($craftingLog.current_craft.attributes.strength).toFixed(0) / STRENGTH_MAX) *
				100
			).toFixed(0);
			resiliencePercent = (
				(Number($craftingLog.current_craft.attributes.resilience).toFixed(0) / RESILIENCE_MAX) *
				100
			).toFixed(0);
			agilityPercent = (
				(Number($craftingLog.current_craft.attributes.agility).toFixed(0) / AGILITY_MAX) *
				100
			).toFixed(0);
			speedPercent = (
				(Number($craftingLog.current_craft.attributes.speed).toFixed(0) / SPEED_MAX) *
				100
			).toFixed(0);
			intellectPercent = (
				(Number($craftingLog.current_craft.attributes.intellect).toFixed(0) / INTELLECT_MAX) *
				100
			).toFixed(0);
			luckPercent = (
				(Number($craftingLog.current_craft.attributes.luck).toFixed(0) / LUCK_MAX) *
				100
			).toFixed(0);
		}
	}
</script>

<div class="wrapper">
	{#if buildFailed}
		<div class="header"><h1>Greenprint crafting failed!</h1></div>
		<div class="failed-image"><img alt="Broken Greenprint" src={failUrls['turtle']} /></div>
		<div class="failed-bottom">
			<div>
				<img class="cooldown-icon" alt="NFT Cooldown" src="/assets/greenprint/cooldown.png" />
				<p>
					NFTs used for crafting are on a cooldown for
					<span class="">12h</span>
				</p>
			</div>
			{#if refundedShell}
				<div>
					<img class="burned-icon" alt="Shell used" src="/assets/greenprint/shell-refund.png" />

					<p>
						Base Shellinium cost has been
						<span class="refunded">consumed</span>
					</p>
				</div>
			{/if}
		</div>
		<div class="close">
			<CtaButton
				onClick={claimClick}
				fontSize="16px"
				text="close"
				outlined
				width="280px"
				margin="0 auto"
			/>
		</div>
	{:else}
		<div class="success-top">
			<div class="header"><h1>Greenprint crafting successfully!</h1></div>

			<div class="content">
				<div class="card-totem">
					<div class="card">
						<img alt="Greenprint" use:image={{ src, lazy: true }} class="image" />
					</div>
					<div class="totem-right">
						<p class="totem-header">Totem</p>
						<div
							class="totem"
							style="--border-color: {rarities[$craftingResult.rarity.toLowerCase()]}"
						>
							<div class="icon">
								<img
									alt="icon"
									src="/assets/greenprint/{$craftingResult.totem.toLowerCase()}-icon.png"
								/>
								<p>{$craftingResult.totem.toUpperCase()}</p>
							</div>
							<p
								class="totem-rarity"
								style="--border-color: {rarities[$craftingResult.rarity.toLowerCase()]}"
							>
								{$craftingResult.rarity.toUpperCase()}
							</p>
						</div>
					</div>
				</div>
				<div class="stats">
					<p class="stats-header">Stats</p>
					<div>
						<p class="ability-title">STRENGTH</p>
						<div class="strength-bar">
							<div class="storage-bar-drive">
								<div class="progress-done" style="--storage-filled: {strengthPercent}%" />
							</div>
						</div>
						<div>{Number($craftingLog.current_craft.attributes.strength).toFixed(1)}</div>
					</div>
					<div>
						<p class="ability-title">RESILIENCE</p>

						<div class="resilience-bar">
							<div class="storage-bar-drive">
								<div class="progress-done" style="--storage-filled: {resiliencePercent}%" />
							</div>
						</div>
						<div>{Number($craftingLog.current_craft.attributes.resilience).toFixed(1)}</div>
					</div>
					<div>
						<p class="ability-title">AGILITY</p>
						<div class="agility-bar">
							<div class="storage-bar-drive">
								<div class="progress-done" style="--storage-filled: {agilityPercent}%" />
							</div>
						</div>

						<div>{Number($craftingLog.current_craft.attributes.agility).toFixed(1)}</div>
					</div>
					<div>
						<p class="ability-title">SPEED</p>
						<div class="speed-bar">
							<div class="storage-bar-drive">
								<div class="progress-done" style="--storage-filled: {speedPercent}%" />
							</div>
						</div>
						<div>{Number($craftingLog.current_craft.attributes.speed).toFixed(1)}</div>
					</div>
					<div>
						<p class="ability-title">INTELLECT</p>
						<div class="speed-bar">
							<div class="storage-bar-drive">
								<div class="progress-done" style="--storage-filled: {intellectPercent}%" />
							</div>
						</div>
						<div>{Number($craftingLog.current_craft.attributes.intellect).toFixed(1)}</div>
					</div>
					<div>
						<p class="ability-title">LUCK</p>
						<div class="speed-bar">
							<div class="storage-bar-drive">
								<div class="progress-done" style="--storage-filled: {luckPercent}%" />
							</div>
						</div>
						<div>{Number($craftingLog.current_craft.attributes.luck).toFixed(1)}</div>
					</div>
				</div>
			</div>
		</div>
		<div class="bottom">
			<div class="info">
				<div class="cd">
					<img class="cooldown-icon" alt="NFT Cooldown" src="/assets/greenprint/cooldown.png" />

					<p>
						NFTs used for crafting are on a cooldown for
						<span class="cooldown">24h</span>
					</p>
				</div>
				{#if GSC}
					<div class="burned">
						<img class="burned-icon" alt="Shell used" src="/assets/greenprint/shell-returned.png" />

						<p>
							"Greenprint Shellinium Credit (PLACHOLDER NAME)" has been
							<span class="cooldown">burned</span>
						</p>
					</div>
				{/if}
			</div>
			<div class="Claim">
				<CtaButton
					fontSize="16px"
					text="Claim"
					loading={$waitingConfirmationCrafting}
					onClick={claimClick}
					outlined
					width="280px"
					margin="0 auto"
					disabled={$waitingConfirmationCrafting}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.success-top {
		margin-top: 24px;
	}
	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		min-height: 180px;
	}
	span.cooldown {
		font-weight: 900;
	}
	.cd,
	.burned {
		padding: 0 44px;
		display: flex;
		align-items: center;
	}
	.cooldown-icon,
	.burned-icon {
		width: 36px;
		height: 36px;
		margin-right: 12px;
	}
	p.ability-title {
		font-size: 14px;
		font-weight: 600;
	}

	.stats > div {
		justify-content: space-between;
	}
	.stats > div > p {
		width: 80px;
	}
	.stats > div > div:first-of-type {
		width: 145px;
	}
	.stats > div > div:last-of-type {
		font-size: 14px;
		font-weight: 900;
		width: 25px;
	}
	.stats {
		padding: 0 44px;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 160px;
		margin: 24px auto 0;

		position: relative;
	}
	.stats > div {
		display: flex;
		width: 100%;
	}
	p.stats-header {
		font-size: 16px;
		margin-bottom: 28px;
		width: 75px;
		text-align: center;
	}
	.totem .icon img {
		height: 34px;
		width: 40px;
	}
	.totem {
		border: 1px solid var(--border-color);
		border-radius: 3px;
		width: 93px;
		height: 118px;
		background-color: var(--dark-grey);
	}

	.icon {
		height: 88px;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	}
	.icon p {
		font-size: 15px;
		font-weight: 900;
	}

	.totem-header {
		width: 75px;
		text-align: center;
		position: relative;
		padding-bottom: 4px;
		margin-bottom: 4px;
	}

	.totem-header:before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		margin: 0 auto;
		bottom: 0;
		height: 1px;
		width: 20px; /* or 100px */
		border-bottom: 1px solid var(--primary-teal);
	}

	.stats-header:before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		margin: 0 auto;
		top: 30px;
		height: 1px;
		width: 20px;
		border-bottom: 1px solid var(--primary-teal);
	}

	.storage-bar-drive {
		background-color: #2e2e2e;
		border-radius: 20px;
		position: relative;
		margin: 0 0 15px;
		height: 12px;
		width: 100%;
	}
	.progress-done {
		background: var(--primary-teal);
		box-shadow: 0 0 6px 0 #36ffc0;
		border-radius: 20px;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: var(--storage-filled);
		opacity: 1;
		transition: 1s ease 0.3s;
		margin: 0;
	}

	.totem-right {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 6px;
	}
	.totem-rarity {
		font-size: 12px;
		font-weight: 600;
		border-top: 1px solid var(--border-color);
		height: 30px;
		justify-content: center;
		align-items: center;
		display: flex;
	}
	.card-totem {
		display: flex;
		height: 165px;
		justify-content: space-evenly;
	}
	.card-totem img {
		height: 165px;
		width: 122px;
	}
	.wrapper {
		color: white;
		display: flex;

		flex-direction: column;
		position: relative;
		max-width: 375px;
		margin: 0 auto;
	}

	div.header {
		text-align: center;
		padding: 45px 54px 0;
		margin-bottom: 15px;
	}
	.failed-image,
	.failed-bottom {
		padding: 0 54px;
	}
	h1 {
		font-size: 22px;
		font-weight: 900;
	}

	.failed-image img {
		height: 165px;
		width: 170px;
		margin: 0 auto 34px;
	}

	.failed-bottom {
		margin-top: 34px;
		font-size: 15px;
	}
	.failed-bottom p {
		font-weight: 900;
	}
	.failed-bottom p:first-of-type {
		margin-bottom: 28px;
	}
	.failed-bottom div {
		display: flex;
	}
	.close {
		width: 100%;
		margin-top: 32px;
	}

	@media (min-width: 1024px) {
		.wrapper {
			max-width: none;
			height: 370px;
		}

		.failed-bottom {
			display: flex;
			justify-content: space-evenly;
		}
		.failed-bottom > div {
			display: flex;
			width: 250px;
		}
		.success-top {
			margin-top: 0;
			background-color: #111;
			padding: 0 74px;
			max-height: 370px;
			height: 370px;
		}
		.bottom {
			min-height: 195px;
		}
		.cd,
		.burned {
			padding: 0;
		}
		.card-totem {
			height: 100%;
			width: 325px;
		}

		.stats {
			width: 375px;
		}
		.info {
			margin-top: 24px;
			display: flex;
			padding: 0 80px;
		}
		.totem-right {
			align-self: center;
			height: 183px;
		}
		.content {
			height: 235px;
			display: flex;
			margin-bottom: 20px;
		}
		.cd {
			margin: 0 auto;
		}
		.card {
			width: 170px;
			height: 235px;
		}
		.card img {
			width: 172px;

			height: 234px;
		}
	}
</style>
