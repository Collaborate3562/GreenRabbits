<script>
	import { image, initialize } from 'svelte-cloudinary';
	import { browser } from '$app/env';
	import { now } from 'src/stores/store';
	import { getCooldownData } from 'src/utils/helpers';
	import NfTcooldown from '../greenprint/overlays/NFTcooldown.svelte';
	export let partner;
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	// Hardcoding because safari sucks
	const rarityWidths = {
		common: '55px',
		uncommon: '65px',
		epic: '37px',
		legendary: '59px',
		mythic: '47px'
	};
	export let nftData;

	initialize({ cloud_name: 'green-rabbit-holdings' });
	let source =

		partner?.slug == 'kyleloza' ? nftData?.data.img2 : nftData?.data.img || nftData?.data.video;

	let src = `GreenRabbit/nfts/${source}.png`;

	let imageSource = partner
		? `https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/GreenRabbit/nfts/partners/${partner.slug}/${source}.png`
		: `https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/GreenRabbit/nfts/${source}.png`;
	let showImage = true;

	$: source =

		partner?.slug == 'kyleloza' ? nftData?.data.img2 : nftData?.data.img || nftData?.data.video;

	$: imageSource = partner
		? `https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/GreenRabbit/nfts/partners/${partner.slug}/${source}.png`
		: `https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/GreenRabbit/nfts/${source}.png`;
	let cooldownEnds;
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
</script>

{#if nftData}
	<div
		class="wrapper"
		class:selected={nftData.isSelected}
		style="--rarity-color: {rarities[nftData.data.Rarity.toLowerCase()]};"
	>
		<div class="top">
			<div class="mint">#{nftData.template_mint}</div>
			{#if nftOnCooldown}
				<NfTcooldown {nftData} {cooldownEnds} />
			{/if}
			{#if showImage}
				<img alt={nftData.data.name} src={imageSource} class="image" />{/if}
			<!-- <img
				
				alt="robot"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/QmdzDJ3eBwARsbK5VhK6fe6osjeYCiXfZCrjZNQ3ApWWue.png"
			/> -->
			<div
				class="rarity"
				style="border-color:{rarities[nftData.data.Rarity.toLowerCase()]};
				--width:{rarityWidths[nftData.data.Rarity.toLowerCase()]};"
			>
				{nftData.data.Rarity.toLowerCase()}
			</div>
		</div>
		<div class="bottom">
			<span>{nftData.name}</span>
			<span>{nftData.weight / 10000} SHELL/hr</span>
			<span>{nftData.size} bits</span>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		min-width: 100px;
		max-width: 165px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 170px;
		max-height: 275px;
		position: relative;
		overflow: hidden;
	}
	.wrapper:hover {
		box-shadow: 0 0 0 1px var(--greenish-cyan);
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

	.top {
		height: calc(170px - 65px);
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #343434;
		position: relative;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		font-size: 11px;
		color: var(--pure-white);
		height: 65px;
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
		margin-top: 12px;
	}
	.bottom span:not(:first-of-type) {
	}

	.mint {
		position: absolute;
		top: 6px;
		right: 10px;
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 9px;
		color: var(--pure-white);
		border: 2px solid var(--primary-teal);
		border-radius: 25px;
		padding: 4px 8px;
		text-align: center;
	}

	.rarity {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		bottom: -15px;
		right: 0;
		left: 0;
		margin: 0 auto;
		width: var(--width);
		padding: 4px 8px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.image {
		object-fit: scale-down;
		width: 55px;
		height: 75px;
	}

	@media (min-width: 481px) {
		.wrapper {
			height: 275px;
		}

		.top {
			height: calc(275px - 95px);
		}

		.bottom {
			height: 95px;
			font-size: 14px;
		}

		.image {
			width: 100px;
			height: 130px;
		}

		.mint {
			width: 54px;
		}

		.wrapper:before {
			margin: -30px;
			width: 60px;
			height: 60px;
		}
	}

	@media (min-width: 768px) {
		.wrapper {
		}
	}
</style>
