<script>
	import { tokens } from 'src/utils/constants';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import CtaButton from './CTAButton.svelte';
	export let onClick;
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
	const sizes = {
		common: 32,
		uncommon: 128,
		epic: 512,
		legendary: 2048,
		mythic: 4096
	};

	export let nftData;
	let innerWidth;

	let source = nftData?.data.img || nftData?.data.video;
	let src = `GreenRabbit/nfts/${source}.png`;

	let imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
	let showImage = true;

	$: source = nftData?.data.img || nftData?.data.video;
	$: imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
</script>

<svelte:window bind:innerWidth />

{#if nftData}
	<div class="CardOuter" on:click={onClick}>
		<div
			class="CardWrapper"
			class:selected={nftData.isSelected}
			style="--rarity-color: {rarities[nftData.data.Rarity.toLowerCase()]};"
		>
			<div class="top">
				{#if nftData.template_mint != '0'}
					<div class="MintBadge">#{nftData.template_mint}</div>
				{/if}
				<img alt={nftData.data.name} src={imageSource} class="ImageComp" />
			</div>
			<div class="bottom">
				<div class="CollectionBadge">{nftData.collection.collection_name.toLowerCase()}</div>
				<div class="RarityBadge">{nftData.data.Rarity.toLowerCase()}</div>
				<p class="TokenName">{nftData.name}</p>
				{#each nftData.reward as reward}
					<p class="CapacityLabel">
						{toFixedCurrency(Number(reward.split(' ')[0]), 2)}
						{tokens[reward.split(' ')[1]]}
					</p>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.CardWrapper {
		height: auto;
		position: relative;
		margin: 8px;
		background-color: rgba(0, 0, 0, 0.8);
		background-image: linear-gradient(to bottom, #151515, #343434);
		overflow: hidden;
		color: #fff;
	}

	.CardWrapper:before {
		content: '';
		position: absolute;
		margin: -30px;
		width: 60px;
		height: 60px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
		z-index: 1;
	}
	.bottom {
		background-color: #1d1d1d;
		padding-bottom: 12px;
		margin: 0 auto;
		position: relative;
		width: 100%;
		height: 176px;
	}
	.bottom a {
		margin: 15px auto;
	}
	.ImageComp {
		padding: 0 24px;
		align-self: center;
		max-height: 300px;
		margin: 0 auto;
	}
	.top {
		height: 264px;
		display: flex;
		padding: 15px;
	}

	.CardOuter {
		width: 237px;
	}
	.CardOuter::before {
		content: '';
		position: absolute;
		margin: -30px;
		width: 60px;
		height: 60px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
	}
	.TokenName {
		text-align: center;
		font-size: 17px;
		font-weight: 900;
		padding: 37px 16px 0;
	}
	.CapacityLabel {
		color: #36ffc0;
		font-family: Lato;
		font-size: 15px;
		text-align: center;
	}
	.CollectionBadge {
		font-size: 12px;
		font-weight: bold;
		position: absolute;
		top: -15px;
		left: 15px;
		background-color: #1d1d1d;
		width: fit-content;
		padding: 6px 12px;
		border-radius: 25px;
		border: 2px solid var(--primary-teal);
	}
	.RarityBadge {
		font-size: 12px;
		font-size: 12px;
		font-weight: bold;
		position: absolute;
		top: -15px;
		right: 15px;
		background-color: #1d1d1d;
		width: fit-content;
		min-width: 33px;
		padding: 6px 12px;
		border-radius: 25px;
		text-align: center;
		border: 2px solid var(--rarity-color);
	}
	.MintBadge {
		font-size: 12px;
		position: absolute;
		top: 15px;
		right: 15px;
		background-color: #1d1d1d;
		width: fit-content;
		padding: 3px 14px;
		border-radius: 25px;
		border: 1px solid var(--primary-teal);
		text-align: center;
	}
	@media (max-width: 570px) {
		.bottom {
			height: 137px;
		}
		.CardWrapper {
			width: 145px;
			height: 290px;
		}
		.CardWrapper:before {
			width: 48px;
			height: 48px;
			padding-bottom: 8px;
		}

		.MintBadge {
			font-size: 9px;
			top: 7px;
			right: 7px;
			padding: 1px 7px;
		}

		.RarityBadge {
			font-size: 9px;
			font-weight: bold;
			position: absolute;
			top: -10px;
			right: 19px;
			min-width: 33px;
			padding: 3px 6px;
			border-radius: 25px;
			border: 1px solid #fff;
		}

		.CardOuter {
			width: 155px;
		}
		.top {
			height: 153px;
		}
		.CardOuter::before {
			width: 48px;
			height: 48px;
			padding-bottom: 8px;
		}
		.ImageComp {
			max-height: 125px;
			padding: 0;
		}
		.TokenName {
			text-align: center;
			font-size: 14px;
			font-weight: 900;
			padding: 24px 16px 0;
		}
		.CapacityLabel {
			margin: 25px 10px 10px 10px;
			font-size: 14px;
		}
		.CollectionBadge {
			font-size: 9px;
			font-weight: bold;

			top: -9px;
			left: 10px;

			padding: 3px 6px;

			border: 1px solid #36ffc0;
		}
	}
	.selected {
		box-shadow: 0 0 0 3px #36ffc0;
	}
	.wrapper {
		min-width: 100px;
		max-width: 155px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 285px;
		position: relative;
		overflow: hidden;
	}
	.wrapper:hover {
		box-shadow: 0 0 0 3px var(--primary-teal);
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
		height: calc(285px - 125px);
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

		font-size: 14px;
		color: var(--pure-white);
		height: 125px;
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
		font-weight: 900;
	}
	.bottom span:first-of-type {
		margin-top: 12px;
	}
	.bottom span:nth-child(2) {
		color: var(--primary-teal);

		margin-bottom: 14px;
	}

	.rarity {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		bottom: -9px;
		right: 5px;
		width: var(--width);
		padding: 0px 8px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.collection {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		height: 17px;

		bottom: -9px;
		left: 5px;
		width: 64px;
		padding: 0px 8px;
		border: 2px solid var(--primary-teal);
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.image {
		object-fit: scale-down;
		width: 42px;
		height: 125px;
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
			width: 40px;
		}

		.wrapper:before {
			margin: -30px;
			width: 60px;
			height: 60px;
		}
	}

	@media (min-width: 1024px) {
		.wrapper {
			max-width: 237px;
			max-height: 445px;
			min-width: 237px;
			min-height: 445px;
		}

		.top {
			height: calc(445px - 180px);
		}
		.bottom {
			height: 180px;
		}
		.bottom span {
			font-size: 17px;
		}
		.bottom span:first-of-type {
			margin-top: 22px;
			margin-bottom: 20px;
		}
		.collection,
		.rarity {
			width: 95px;
			padding: 8px 16px;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 30px;
			bottom: -15px;
			font-size: 12px;
		}

		.collection {
			left: 20px;
		}
		.rarity {
			right: 20px;
		}
	}
</style>
