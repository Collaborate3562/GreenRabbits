<script>
	import NfTcooldown from './overlays/NFTcooldown.svelte';
	import { convertHexToRGBA, getCooldownData } from 'src/utils/helpers';
	import NftStaked from './overlays/NFTStaked.svelte';
	import { now } from 'src/stores/store';
	import GPCardTooltip from './overlays/GPCardTooptip.svelte';
	import { Popover } from 'sveltestrap';

	export let disabled = false;
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	// Hardcoding because safari sucks
	const rarityWidths = {
		common: '65px',
		uncommon: '80px',
		epic: '43px',
		legendary: '72px',
		mythic: '57px'
	};

	export let nftData;
	export let selectedType;

	let nftIsStaked = nftData.isStaked;
	let cooldownEnds;
	let bonusStat = nftData?.bonusStats?.total || 0;
	let end =
		Number(nftData.mutable_data['Last Used']) +
		3600 * (12 * Number(nftData.mutable_data['Status Type']));
	$: end =
		Number(nftData.mutable_data['Last Used']) +
		3600 * (12 * Number(nftData.mutable_data['Status Type']));
	let nftOnCooldown = false;

	$: {
		if ($now) {
			let cooldownEndsUnixTs = getCooldownData(nftData);
			cooldownEnds = cooldownEndsUnixTs;
			nftOnCooldown = new Date().getTime() / 1000 < cooldownEndsUnixTs;
		}
	}

	let source = nftData?.data.img || nftData?.data.video;

	let src = `GreenRabbit/nfts/${source}.png`;
	let imageSource;
	export let boosting = false;
	if (boosting) {
		imageSource = `./assets/${source}`;
	} else {
		imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/v1/GreenRabbit/nfts/${source}.png`;
	}
	let showImage = true;
	$: source = nftData?.data.img || nftData?.data.video;
	$: imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
</script>

{#if nftData}
	{#if nftData.data.Rarity}
		<div
			class="wrapper"
			class:disabled
			id={`gp-${nftData.asset_id}`}
			class:selected={nftData.isSelected}
			style="--rarity-color: {rarities[nftData.data.Rarity.toLowerCase()]};"
		>
			<div class="top" class:selectedBg={nftData.isSelected}>
				{#if nftIsStaked}
					<NftStaked {nftData} />
				{/if}
				{#if nftOnCooldown}
					<NfTcooldown {nftData} {cooldownEnds} />
				{/if}
				<GPCardTooltip {nftData} />
				<div class="mint">#{nftData.template_mint}</div>
				{#if showImage}
					<div class="imgShow">
						<img
							class:staked={nftIsStaked || nftOnCooldown}
							alt={nftData.data.name}
							src={imageSource}
							class="image"
						/>

						{#if selectedType && selectedType.name == 'orbs'}
							<div class="messagePopUp">
								Rarities of the Greenprint and the Ascendant Orb need to be the same
							</div>
						{/if}
					</div>
				{/if}

				{#if nftData.bonus || nftData.data['Boost Count']}
					<div class="bosted_bonus">
						{#if nftData.bonus}
							<div class="bonusWrapper">
								<div class="bonus">
									<img src="/assets/bonus.svg" alt="bonus" />
									{nftData.bonus}%
								</div>
								<div class="messagePopUp">
									Bonus stats : {nftData.bonus}%
								</div>
							</div>
						{/if}
						{#if nftData.data['Boost Count']}
							<div class="boostWrapper">
								<div class="bonus">
									<img src="/assets/boosted.svg" alt="bonus" />
									{nftData.data['Boost Count']}/10
								</div>
							</div>
						{/if}
					</div>
				{/if}
				{#if bonusStat > 0}
					<div class="bosted_bonus">
						<div class="bonusWrapper">
							<div class="bonus">
								<img src="/assets/bonus.svg" alt="bonus" />
								{bonusStat.toFixed(2)}%
							</div>
						</div>
						<!-- <div class="boostedWrapper">
						<div class="boosted">
							<img src="/assets/boosted.svg" alt="boosted" />
							1
						</div>
					</div> -->
					</div>
				{/if}
				{#if bonusStat > 0}
					<div class="bosted_bonus">
						<div class="bonusWrapper">
							<div class="bonus">
								<img src="/assets/bonus.svg" alt="bonus" />
								{bonusStat.toFixed(2)}%
							</div>
						</div>
						<!-- <div class="boostedWrapper">
						<div class="boosted">
							<img src="/assets/boosted.svg" alt="boosted" />
							1
						</div>
					</div> -->
					</div>
				{/if}
				<div
					class="rarity"
					style="border-color:{nftIsStaked || nftOnCooldown
						? convertHexToRGBA(rarities[nftData.data.Rarity.toLowerCase()], 30)
						: rarities[nftData.data.Rarity.toLowerCase()]};
				--width:{rarityWidths[nftData.data.Rarity.toLowerCase()]};"
				>
					{nftData.data.Rarity.toLowerCase()}
				</div>
				{#if nftData.totem}
					<div
						style="--border-color:{nftIsStaked || nftOnCooldown
							? convertHexToRGBA('#a3a3a3', 30)
							: '#a3a3a3'};"
						class="token"
					>
						{nftData.totem ? nftData.totem : ''}
					</div>
				{/if}
			</div>

			<div class="bottom">
				<span class="nft-name">{nftData.name}</span>

				<span class="type">{nftData.totem ? nftData.totem : ''}</span>
			</div>
		</div>
		{#if disabled}
			<Popover
				trigger="hover"
				placement="top"
				target={`gp-${nftData.asset_id}`}
				class="center-tooltip"
			>
				<p>All selected assets must be of the same rarity</p>
			</Popover>
		{/if}
	{/if}
{/if}

<style>
	.bosted_bonus .bonusWrapper {
		margin: 0 7px;
		color: rgb(255, 255, 255);
		position: absolute;
		top: 52%;
		left: 44%;
		cursor: default;
	}
	.bosted_bonus .boostWrapper {
		margin: 0 7px;
		color: rgb(255, 255, 255);
		position: absolute;
		top: 52%;
		left: 0%;
		cursor: default;
	}
	.bonus {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		background: black;
		padding: 5px;
	}
	.boostedWrapper .boosted {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		background: black;
		padding: 5px;
	}
	.bonus img,
	.boosted img {
		margin-right: 5px;
	}
	.staked {
		opacity: 0.2;
	}
	.disabled {
		opacity: 0.5;
	}
	.selectedBg {
		background-image: linear-gradient(to bottom, #484848, #343434) !important;
	}
	.wrapper {
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		min-width: 155px;
		max-width: 155px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 300px;
		max-height: 300px;
		position: relative;
		overflow: hidden;
	}
	.wrapper:hover {
		box-shadow: 0 0 0 2px var(--primary-teal);
		cursor: pointer;
	}
	.selected {
		box-shadow: 0 0 0 3px var(--primary-teal) !important;
	}
	.top {
		height: 215px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-image: linear-gradient(to bottom, #151515, #343434);
		position: relative;
		display: flex;
		flex-direction: column;
	}
	.bottom {
		display: flex;
		flex-direction: column;
		font-size: 11px;
		color: var(--pure-white);
		height: 85px;
		background-color: var(--dark-grey);
		bottom: 0;
		padding: 0 8px 0;
	}
	.bottom span {
		width: 100%;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 15px;
	}
	.bottom span:first-of-type {
		color: var(--primary-teal);
		margin-bottom: 4px;
		font-weight: 900;
	}
	.bottom span:not(:first-of-type) {
		margin-bottom: 10px;
	}
	.bottom span:last-of-type {
		font-weight: 600;
	}
	.mint {
		position: absolute;
		top: 6px;
		right: 10px;
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 12px;
		color: var(--pure-white);
		width: 57px;
		height: 25px;
		border-radius: 25px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.rarity {
		/* position: absolute; */
		bottom: -15px;
		right: 0;
		left: 0;
		margin: 0 auto;
		width: 140px;
		height: 25px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		font-size: 13px;
		font-weight: 600;
		text-align: center;
	}
	.token {
		/* position: absolute; */
		bottom: -15px;
		height: 25px;
		margin: 6px auto 0;
		width: 140px;
		border: 2px solid var(--border-color);
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		font-size: 13px;
		font-weight: 600;
		text-align: center;
	}
	.image {
		object-fit: scale-down;
		width: 95px;
		height: 135px;
	}
	@media (min-width: 1024px) {
		.wrapper {
			height: 330px;
			width: 195px;
			max-height: 330px;
			max-width: 195px;
		}

		.bosted_bonus .boostWrapper {
			margin: 0 7px;
			color: rgb(255, 255, 255);
			position: absolute;
			top: 68%;
			left: 7%;
			cursor: default;
		}
		.bosted_bonus .bonusWrapper,
		.bosted_bonus .boostedWrapper {
			margin: 0 7px;
			color: rgb(255, 255, 255);
			padding: 5px;
			cursor: default;
			position: absolute;
			top: 66%;
			left: 47%;
		}
		.bottom {
			height: 110px;
		}
		.top {
			background-color: #343434;
			height: calc(330px - 110px);
		}
		.image {
			width: 140px;
			height: 170px;
		}
		.rarity {
			left: 10px;
			margin: 0;
			font-size: 12px;
			position: absolute;
			width: var(--width);
			padding: 4px 12px;
			font-size: 9px;
			font-weight: bold;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.token {
			position: absolute;
			width: 140px;
			margin: 0;
			right: 10px;
			font-size: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto;
			width: 80px;
			padding: 4px 12px;
			font-size: 9px;
			font-weight: bold;
		}
		.shell-hr {
			margin-top: 10px;
			font-size: 15px;
		}
		.type {
			margin-top: 5px;
			margin-bottom: 16px;
			font-size: 15px;
		}
		span.nft-name {
			margin-top: 26px;
			font-size: 16px;
		}
		.mint {
			top: 12px;
			right: 12px;
		}
		.bottom span {
			line-height: 15px;
		}
	}
</style>
