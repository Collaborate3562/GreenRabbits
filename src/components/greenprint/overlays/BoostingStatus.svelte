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
	let buildFailed = false;
	let buildCorrupted = false;
	let buildSucceded = true;
	export let craftLog;
	export let onClick;
	let orbDestroyed = null;
	let extraGreenprint = true;
	function oneRarityUp(rarity) {
		switch (rarity) {
			case 'Common':
				return 'Uncommon';
			case 'Uncommon':
				return 'Epic';
			case 'Epic':
				return 'Legendary';
			case 'Legendary':
				return 'Mythic';
			case 'Mythic':
				return 'Mythic';
		}
	}
	let outcome = craftLog.outcome;

	let rarity = craftLog.greenprintData.data.Rarity;
	let totem = craftLog.greenprintData.data.Totem;
	let newGreenprint = null;

	function getStats() {}

	if (outcome == 'common') {
		getStats();
		orbDestroyed = true;
	} else {
		if (rarity == 'Mythic') {
			orbDestroyed = false;
		} else {
			newGreenprint = oneRarityUp(rarity);
			orbDestroyed = true;
		}
	}
	let GSC = false;
	let claimClick;
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
	let source = craftLog.greenprintData.data.img;
	$: src = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
	let strengthPercent = 0;
	let strengthPercentBoost = 0;
	let resiliencePercent = 0;
	let resiliencePercentBoost = 0;
	let agilityPercent = 0;
	let agilityPercentBoost = 0;
	let speedPercent = 0;
	let speedPercentBoost = 0;
	let intellectPercent = 0;
	let intellectPercentBoost = 0;
	let luckPercent = 0;
	let luckPercentBoost = 0;
	/* $: {
		if (craftLog.outcome != 'fail') {
			if (craftLog.outcome == 'common') {
				buildSucceded = true;
			}
		} else {
			buildFailed = true;
		}
	} */
	let isSuccess =
		Number(craftLog.old_attributes.strength) < Number(craftLog.new_attributes.strength) ||
		Number(craftLog.old_attributes.resilience) < Number(craftLog.new_attributes.resilience) ||
		Number(craftLog.old_attributes.agility) < Number(craftLog.new_attributes.agility) ||
		Number(craftLog.old_attributes.speed) < Number(craftLog.new_attributes.speed) ||
		Number(craftLog.old_attributes.intellect) < Number(craftLog.new_attributes.intellect) ||
		Number(craftLog.old_attributes.luck) < Number(craftLog.new_attributes.luck);
	/* 	let isSuccess = false; */
	$: {
		if (craftLog) {
			strengthPercent = (
				(Number(craftLog.old_attributes.strength).toFixed(2) / STRENGTH_MAX) *
				100
			).toFixed(0);
			strengthPercentBoost = (
				(Number(craftLog.new_attributes.strength).toFixed(2) / STRENGTH_MAX) *
				100
			).toFixed(0);
			resiliencePercent = (
				(Number(craftLog.old_attributes.resilience).toFixed(2) / RESILIENCE_MAX) *
				100
			).toFixed(0);
			resiliencePercentBoost = (
				(Number(craftLog.new_attributes.resilience).toFixed(2) / RESILIENCE_MAX) *
				100
			).toFixed(0);
			agilityPercent = (
				(Number(craftLog.old_attributes.agility).toFixed(2) / AGILITY_MAX) *
				100
			).toFixed(0);
			agilityPercentBoost = (
				(Number(craftLog.new_attributes.agility).toFixed(2) / AGILITY_MAX) *
				100
			).toFixed(0);
			speedPercent = ((Number(craftLog.old_attributes.speed).toFixed(2) / SPEED_MAX) * 100).toFixed(
				0
			);
			speedPercentBoost = (
				(Number(craftLog.new_attributes.speed).toFixed(2) / SPEED_MAX) *
				100
			).toFixed(0);
			intellectPercent = (
				(Number(craftLog.old_attributes.intellect).toFixed(2) / INTELLECT_MAX) *
				100
			).toFixed(0);
			intellectPercentBoost = (
				(Number(craftLog.new_attributes.intellect).toFixed(2) / INTELLECT_MAX) *
				100
			).toFixed(0);
			luckPercent = ((Number(craftLog.old_attributes.luck).toFixed(2) / LUCK_MAX) * 100).toFixed(0);
			luckPercentBoost = (
				(Number(craftLog.new_attributes.luck).toFixed(2) / LUCK_MAX) *
				100
			).toFixed(0);
		}
	}
</script>

<div class="wrapper">
	<div class="success-top">
		<div class="header"><h1>Greenprint boosting attempt complete!</h1></div>
		<div class="subheader">
			<h2>{isSuccess ? 'Stats have increased!' : 'Stat attributes failed to boost'}</h2>
		</div>
		<div class="content">
			<div class="card-totem">
				<div class="card">
					<img alt="Greenprint" {src} class="image" />
				</div>
				<div class="totem-right">
					<p class="totem-header">Totem</p>
					<div class="totem" style="--border-color: {rarities[rarity.toLowerCase()]}">
						<div class="icon">
							<img alt="icon" src="/assets/greenprint/{totem.toLowerCase()}-icon.png" />
							<p>{totem.toUpperCase()}</p>
						</div>
						<p class="totem-rarity" style="--border-color: {rarities[rarity.toLowerCase()]}">
							{rarity.toUpperCase()}
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
							{#if Number(craftLog.old_attributes.strength) < Number(craftLog.new_attributes.strength)}
								<div class="progress-boost" style="--storage-filled: {strengthPercentBoost}%" />
							{/if}

							<div
								class="progress-done"
								style="{Number(craftLog.old_attributes.strength) <
								Number(craftLog.new_attributes.strength)
									? 'margin-top: -12px;'
									: ''}--storage-filled:
						{strengthPercent}%"
							/>
						</div>
					</div>
					<div class="statsNumbers">
						<div class="fixedW">{Number(craftLog.old_attributes.strength).toFixed(2)}</div>
						{#if Number(craftLog.old_attributes.strength) < Number(craftLog.new_attributes.strength)}
							<div class="arrow green">
								<img src="./arrow.png" alt="arrow" />
							</div>
							<div>{Number(craftLog.new_attributes.strength).toFixed(2)}</div>
						{:else}
							<div class="fail">
								<img src="/icons/close.svg" width="13px" height="13px" alt="" />
							</div>
						{/if}
					</div>
				</div>
				<div>
					<p class="ability-title">RESILIENCE</p>

					<div class="resilience-bar">
						<div class="storage-bar-drive">
							{#if Number(craftLog.old_attributes.resilience) < Number(craftLog.new_attributes.resilience)}
								<div class="progress-boost" style="--storage-filled: {resiliencePercentBoost}%" />
							{/if}

							<div
								class="progress-done"
								style="{Number(craftLog.old_attributes.resilience) <
								Number(craftLog.new_attributes.resilience)
									? 'margin-top: -12px;'
									: ''}--storage-filled:
						{resiliencePercent}%"
							/>
						</div>
					</div>
					<div class="statsNumbers">
						<div class="fixedW">{Number(craftLog.old_attributes.resilience).toFixed(2)}</div>
						{#if Number(craftLog.old_attributes.resilience) < Number(craftLog.new_attributes.resilience)}
							<div class="arrow green">
								<img src="./arrow.png" alt="arrow" />
							</div>
							<div>{Number(craftLog.new_attributes.resilience).toFixed(2)}</div>
						{:else}
							<div class="fail">
								<img src="/icons/close.svg" width="13px" height="13px" alt="" />
							</div>
						{/if}
					</div>
				</div>
				<div>
					<p class="ability-title">AGILITY</p>
					<div class="agility-bar">
						<div class="storage-bar-drive">
							{#if Number(craftLog.old_attributes.agility) < Number(craftLog.new_attributes.agility)}
								<div class="progress-boost" style="--storage-filled: {agilityPercentBoost}%" />
							{/if}

							<div
								class="progress-done"
								style="{Number(craftLog.old_attributes.agility) <
								Number(craftLog.new_attributes.agility)
									? 'margin-top: -12px;'
									: ''}--storage-filled:
						{agilityPercent}%"
							/>
						</div>
					</div>
					<div class="statsNumbers">
						<div class="fixedW">{Number(craftLog.old_attributes.agility).toFixed(2)}</div>
						{#if Number(craftLog.old_attributes.agility) < Number(craftLog.new_attributes.agility)}
							<div class="arrow green">
								<img src="./arrow.png" alt="arrow" />
							</div>
							<div>{Number(craftLog.new_attributes.agility).toFixed(2)}</div>
						{:else}
							<div class="fail">
								<img src="/icons/close.svg" width="13px" height="13px" alt="" />
							</div>
						{/if}
					</div>
				</div>
				<div>
					<p class="ability-title">SPEED</p>
					<div class="speed-bar">
						<div class="storage-bar-drive">
							{#if Number(craftLog.old_attributes.speed) < Number(craftLog.new_attributes.speed)}
								<div class="progress-boost" style="--storage-filled: {speedPercentBoost}%" />
							{/if}

							<div
								class="progress-done"
								style="{Number(craftLog.old_attributes.speed) <
								Number(craftLog.new_attributes.speed)
									? 'margin-top: -12px;'
									: ''}--storage-filled:
						{speedPercent}%"
							/>
						</div>
					</div>
					<div class="statsNumbers">
						<div class="fixedW">{Number(craftLog.old_attributes.speed).toFixed(2)}</div>
						{#if Number(craftLog.old_attributes.speed) < Number(craftLog.new_attributes.speed)}
							<div class="arrow green">
								<img src="./arrow.png" alt="arrow" />
							</div>
							<div>{Number(craftLog.new_attributes.speed).toFixed(2)}</div>
						{:else}
							<div class="fail">
								<img src="/icons/close.svg" width="13px" height="13px" alt="" />
							</div>
						{/if}
					</div>
				</div>
				<div>
					<p class="ability-title">INTELLECT</p>
					<div class="speed-bar">
						<div class="storage-bar-drive">
							{#if Number(craftLog.old_attributes.intellect) < Number(craftLog.new_attributes.intellect)}
								<div class="progress-boost" style="--storage-filled: {intellectPercentBoost}%" />
							{/if}

							<div
								class="progress-done"
								style="{Number(craftLog.old_attributes.intellect) <
								Number(craftLog.new_attributes.intellect)
									? 'margin-top: -12px;'
									: ''}--storage-filled:
						{intellectPercent}%"
							/>
						</div>
					</div>
					<div class="statsNumbers">
						<div class="fixedW">{Number(craftLog.old_attributes.intellect).toFixed(2)}</div>
						{#if Number(craftLog.old_attributes.intellect) < Number(craftLog.new_attributes.intellect)}
							<div class="arrow green">
								<img src="./arrow.png" alt="arrow" />
							</div>
							<div>{Number(craftLog.new_attributes.intellect).toFixed(2)}</div>
						{:else}
							<div class="fail">
								<img src="/icons/close.svg" width="13px" height="13px" alt="" />
							</div>
						{/if}
					</div>
				</div>
				<div>
					<p class="ability-title">LUCK</p>
					<div class="speed-bar">
						<div class="storage-bar-drive">
							{#if Number(craftLog.old_attributes.luck) < Number(craftLog.new_attributes.luck)}
								<div class="progress-boost" style="--storage-filled: {luckPercentBoost}%" />
							{/if}

							<div
								class="progress-done"
								style="{Number(craftLog.old_attributes.luck) < Number(craftLog.new_attributes.luck)
									? 'margin-top: -12px;'
									: ''}--storage-filled:
						{luckPercent}%"
							/>
						</div>
					</div>
					<div class="statsNumbers">
						<div class="fixedW">{Number(craftLog.old_attributes.luck).toFixed(2)}</div>
						{#if Number(craftLog.old_attributes.luck) < Number(craftLog.new_attributes.luck)}
							<div class="arrow green">
								<img src="./arrow.png" alt="arrow" />
							</div>
							<div>{Number(craftLog.new_attributes.luck).toFixed(2)}</div>
						{:else}
							<div class="fail">
								<img src="/icons/close.svg" width="13px" height="13px" alt="" />
							</div>
						{/if}
					</div>
				</div>
			</div>
			{#if orbDestroyed == false || newGreenprint}
				<div class="extra">
					<div class="reward">
						{#if orbDestroyed == false}
							<img
								style="max-width:140px;object-fit:scale-down;"
								src={`https://greenrabbit.mypinata.cloud/ipfs/${craftLog.orb.data.img}`}
								alt="ORB"
							/>

							<p
								style="  margin-top:25px;font-size: 16px;
								width: 190px;
							font-weight: 500;
							font-stretch: normal;
							font-style: normal;
							line-height: normal;
							letter-spacing: normal;
							text-align: center;
							color: #fff;"
							>
								Ascendant Orb is returned to your inventory!
							</p>
						{/if}
						{#if newGreenprint}
							<img
								style="max-width:140px;object-fit:scale-down;"
								src="/game_assets/gp.png"
								alt="GP"
							/>
							<div class="rarity" style="--border-color: {rarities[newGreenprint.toLowerCase()]}">
								<p
									class="totem-rarity"
									style="--border-color: {newGreenprint[rarity.toLowerCase()]}"
								>
									{newGreenprint.toUpperCase()}
								</p>
							</div>
							<p
								style="  margin-top:25px;font-size: 16px;
						width: 190px;
					font-weight: 500;
					font-stretch: normal;
					font-style: normal;
					line-height: normal;
					letter-spacing: normal;
					text-align: center;

					color: #fff;"
							>
								You got an additional Greenprint!
							</p>
						{/if}
					</div>
				</div>{/if}
		</div>
	</div>
	<div class="bottom">
		<div class="info">
			{#if orbDestroyed == true}
				<div class="burned">
					<img class="burned-icon" alt="Shell used" src="/assets/greenprint/shell-returned.png" />

					<p>
						Ascendant Orb used for boosting
						<span class="cooldown">is destroyed</span>
					</p>
				</div>
			{/if}
			{#if newGreenprint}
				<div class="cd">
					<img class="cooldown-icon" alt="NFT Cooldown" src="/assets/greenprint/cooldown.png" />

					<p>
						You recieved an additional GP of
						<span class="cooldown">{newGreenprint} Rarity</span>
					</p>
				</div>
			{/if}
		</div>
		<div class="Claim">
			<CtaButton
				fontSize="16px"
				text="Claim"
				loading={$waitingConfirmationCrafting}
				{onClick}
				outlined
				width="280px"
				margin="0 auto"
			/>
		</div>
	</div>
</div>

<style>
	.fail {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 19px;
		margin-left: 5px;
	}

	.image {
		height: 250px;
		min-width: 143px;
		object-fit: scale-down;
		padding: 5px;
	}
	.reward {
		border-radius: 4px;
		min-width: 230px;
		min-height: 276px;
		border: solid 1px #b7b5b5;
		background-image: linear-gradient(331deg, #0f0f0f 82%, #1c1c1c 10%);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.extra {
		min-width: 360px;
	}
	.fixedW {
		width: 47px;
		text-align: right;
	}
	.statsNumbers {
		display: flex;
		min-width: 50px;
	}
	.arrow {
		margin: 0 5px;
	}
	.arrow.red img {
		width: 20px;
		filter: invert(42%) sepia(91%) saturate(4041%) hue-rotate(338deg) brightness(98%) contrast(91%);
	}
	.arrow.green img {
		width: 20px;
		filter: invert(86%) sepia(12%) saturate(2039%) hue-rotate(93deg) brightness(98%) contrast(123%);
	}
	.transparentWrapper {
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
	}
	.success-top {
		margin-top: 24px;
	}
	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		min-height: 180px;
		background-color: black;
	}
	.bottom .info div {
		width: 100%;
		max-width: 232px;
		margin: 0 40px;
	}
	span.cooldown {
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
		width: 80px;
	}
	.stats > div {
		justify-content: space-between;
	}
	.stats > div > p {
		width: 100px;
	}
	/*strength-bar*/
	.stats > div > div:first-of-type {
		width: 145px;
		margin: 0 5px;
	}
	.stats > div > div:last-of-type {
		font-size: 14px;
		font-weight: 900;
		width: 157px;
	}
	.stats {
		padding: 0 26px;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: max-content;
		margin: 24px auto 0;
		position: relative;
	}
	.stats > div {
		display: flex;
		width: 100%;
		align-items: center;
		margin: 0 0 8px;
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
	.rarity {
		border: 1px solid var(--border-color);
		border-radius: 24px;
		width: 93px;
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
	.progress-boost {
		background: #ffec00;
		/* 	box-shadow: 0 0 6px 0 #36ffc0; */
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
		background-color: #111111;
		flex-direction: column;
		position: relative;
		margin: 0 auto;
		width: 100%;
	}
	div.header {
		text-align: center;
		padding: 45px 54px 0;
		margin-bottom: 15px;
	}
	div.subheader {
		text-align: center;
	}
	h1 {
		font-size: 22px;
		font-weight: 900;
	}
	.failed-image img {
		height: 100%;
		width: 250px;
		margin: 0 auto 34px;
	}
	.close {
		width: 100%;
		margin-top: 32px;
		min-height: 45px;
	}
	@media (min-width: 1024px) {
		.wrapper {
			height: max-content;
		}
		.success-top {
			margin-top: 0;
			background-color: #111;
			padding: 0 20px;
			height: max-content;
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
			justify-content: center;
		}
		.totem-right {
			align-self: center;
			height: 183px;
		}
		.content {
			height: max-content;
			display: flex;
			margin-bottom: 20px;
		}
		.card img {
			width: 100%;
			height: 250px;
		}
	}
	@media (max-width: 1240px) {
		.info {
			font-size: 12px;
		}
		.bottom .info div {
			margin: 10px 0;
			max-width: 100%;
		}
	}
</style>
