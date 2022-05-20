<script>
	import { image, initialize } from 'svelte-cloudinary';
	import { browser } from '$app/env';
	import NfTcooldown from './overlays/NFTcooldown.svelte';
	import { convertHexToRGBA, getCooldownData } from 'src/utils/helpers';
	import NftStaked from './overlays/NFTStaked.svelte';
	import { now } from 'src/stores/store';

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
	let nftIsStaked = false;
	let nftOnCooldown = false;
	let cooldownEnds;

	$: {
		if ($now) {
			let cooldownEndsUnixTs = getCooldownData(nftData);
			cooldownEnds = cooldownEndsUnixTs;
			nftOnCooldown = new Date().getTime() / 1000 < cooldownEndsUnixTs;
		}
	}

	initialize({ cloud_name: 'green-rabbit-holdings' });

	let source = nftData?.data.img || nftData?.data.video;
	let src = `GreenRabbit/nfts/${source}.png`;

	let imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
	let showImage = true;

	$: source = nftData?.data.img || nftData?.data.video;
	$: imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
</script>

{#if nftData}
	<div
		class="wrapper"
		class:selected={nftData.isSelected}
		style="--rarity-color: {rarities[
			nftData.data.Rarity ? nftData.data.Rarity.toLowerCase() : 'common'
		]};"
	>
		<div class="top">
			{#if nftData.isStaked}
				<NftStaked {nftData} />
			{/if}
			{#if nftOnCooldown}
				<NfTcooldown {nftData} {cooldownEnds} />
			{/if}

			<div class="mint">#{nftData.template_mint}</div>
			<img
				class:staked={nftIsStaked || nftOnCooldown}
				alt={nftData.data.name}
				src={imageSource}
				class="image"
			/>
			<!-- <img
				
				alt="robot"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/QmdzDJ3eBwARsbK5VhK6fe6osjeYCiXfZCrjZNQ3ApWWue.png"
			/> -->
			<div
				class="rarity"
				style="border-color:{nftIsStaked || nftOnCooldown
					? convertHexToRGBA(
							rarities[nftData.data.Rarity ? nftData.data.Rarity.toLowerCase() : 'common'],
							30
					  )
					: rarities[nftData.data.Rarity ? nftData.data.Rarity.toLowerCase() : 'common']};
				--width:{rarityWidths[nftData.data.Rarity ? nftData.data.Rarity.toLowerCase() : 'common']};"
			>
				{nftData.data.Rarity ? nftData.data.Rarity.toLowerCase() : 'common'}
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
			{#if nftData.weight > 0}
				<span class="shell-hr">{nftData.weight / 10000} SHELL/hr</span>{/if}
			<span class="type"> {nftData.totem ? nftData.totem : ''}</span>
		</div>
	</div>
{/if}

<style>
	.staked {
		opacity: 0.2;
	}
	.top {
		height: calc(275px - 95px);
	}
	.wrapper {
		border-radius: 4px;
		min-width: 100px;
		max-width: 165px;
		/* max-width: xyz px; USE THIS scaling to tablet */

		height: 275px;

		position: relative;
		overflow: hidden;
		border-radius: 4px;
		border: solid 1px #484848;
		background-image: linear-gradient(to bottom, #151515, #343434);
	}
	.wrapper:hover {
		box-shadow: 0 0 0 2px var(--primary-teal);
		cursor: pointer;
	}
	.selected {
		box-shadow: 0 0 0 3px var(--primary-teal) !important;
	}
	.wrapper:before {
		content: '';
		position: absolute;
		margin: -25px;
		width: 50px;
		height: 50px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
		z-index: 3;
	}

	/* 	.top {
		height: calc(170px - 65px);
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #343434;
		position: relative;
	} */

	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		font-size: 11px;
		color: var(--pure-white);
		height: 95px;
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
	}
	.bottom span:first-of-type {
		color: var(--primary-teal);
	}
	.bottom span:not(:first-of-type) {
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
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		bottom: 90px;
		right: 0;
		margin: 0 auto;
		width: var(--width);
		padding: 4px 8px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.token {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		bottom: 90px;
		text-align: center;
		margin: 0 auto;
		width: 80px;
		padding: 4px 12px;
		border: 2px solid var(--border-color);
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image {
		object-fit: scale-down;
		width: 200px;
		height: 100%;
	}

	@media (min-width: 481px) {
		.bottom {
			height: 95px;
			font-size: 14px;
		}

		.wrapper:before {
			margin: -30px;
			width: 60px;
			height: 60px;
		}
	}

	@media (min-width: 1024px) {
		.wrapper {
			height: 330px;
			width: 195px;

			max-height: 330px;
			max-width: 195px;
		}
		.bottom {
			height: 110px;
		}
		.top {
			height: calc(330px - 110px);
		}

		.rarity {
			left: 10px;
			margin: 0;
			font-size: 12px;
		}

		.token {
			margin: 0;
			right: 10px;
			font-size: 12px;
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
	}
</style>
