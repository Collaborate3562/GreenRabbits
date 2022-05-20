<script>
	import { image, initialize } from 'svelte-cloudinary';
	import { browser } from '$app/env';
	import { getContext } from 'svelte';
	import AuxPopup from './AuxPopup.svelte';
	const { open, close } = getContext('simple-modal');
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
	let selectedRarity, selectedSph, selectedType;

	initialize({ cloud_name: 'green-rabbit-holdings' });
	const source = nftData?.data.img || nftData?.data.video;
	const src = `GreenRabbit/nfts/${source}.png`;
	function openAuxDesc() {
		open(AuxPopup, {
			name: nftData.data.name,
			imgSrc: source
		});
	}
</script>

{#if nftData}
	<div
		class="wrapper"
		class:selected={nftData.isSelected}
		style="--rarity-color: {rarities[nftData.data.Rarity.toLowerCase()]};"
	>
		<div class="top">
			<!-- <div class="mint">#{nftData.template_mint}</div> -->
			<img alt={nftData.data.name} use:image={{ src, lazy: true }} class="image" />
			<!-- <img
				
				alt="robot"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/QmdzDJ3eBwARsbK5VhK6fe6osjeYCiXfZCrjZNQ3ApWWue.png"
			/> -->
			<div
				class="rarity"
				style="border-color:{rarities[nftData.data.Rarity.toLowerCase()]};
				--width :143px;"
			>
				{nftData.data.Rarity.toLowerCase()}
			</div>
		</div>
		<div class="bottom">
			<p class="name">{nftData.name}</p>
			<p class="description">
				The Greenprint Shellinium Credit Token can be used when crafting with a 3D NFT of the same
				rarity type <span class="more" on:click={() => openAuxDesc()}>more...</span>
			</p>
		</div>
	</div>
{/if}

<style>
	.more {
		color: var(--primary-teal);
		cursor: pointer;
	}
	.wrapper {
		min-width: 160px;

		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 300px;
		max-height: 300px;
		position: relative;
		overflow: hidden;
		border-radius: 3px;
	}
	.wrapper:hover {
		box-shadow: 0 0 0 3px var(--primary-teal);
		cursor: pointer;
	}
	.selected {
		box-shadow: 0 0 0 3px var(--primary-teal) !important;
	}
	/* .wrapper:before {
		content: '';
		position: absolute;
		margin: -25px;
		width: 50px;
		height: 50px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
		z-index: 3;
	} */

	.top {
		height: 170px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #343434;
		position: relative;
	}

	.bottom {
		display: flex;
		flex-direction: column;

		align-items: center;

		font-size: 11px;
		color: var(--pure-white);
		height: 130px;
		background-color: var(--dark-grey);
		bottom: 0;
		padding: 14px 8px 0;
	}
	.bottom p {
		width: 100%;
		font-size: 12px;
		text-align: center;
		overflow: hidden;
		flex: 1 0 auto;
		text-overflow: ellipsis;
	}
	.bottom p:first-of-type {
		color: var(--primary-teal);
		margin-top: 12px;
	}

	.description {
		/* margin-top: 8px;
		display: flex;
		height: 100%;
		overflow: hidden;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		display: -webkit-box;
		line-height: 20px; */
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
		font-size: 13px;
		font-weight: bold;
		position: absolute;
		bottom: -15px;
		right: 0;
		left: 0;
		text-align: center;
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
		width: 120px;
		height: 110px;
	}

	@media (min-width: 768) {
		.wrapper {
			height: 300px;
			width: 160px;
		}

		.bottom {
			height: 130px;
		}
		.top {
			height: 170px;
		}
	}
</style>
