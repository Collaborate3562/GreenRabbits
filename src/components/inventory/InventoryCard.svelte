<script>
	import { image, initialize } from 'svelte-cloudinary';
	import CtaButton from '../CTAButton.svelte';
	export let nftData;
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	const rarityWidths = {
		common: '55px',
		uncommon: '65px',
		epic: '37px',
		legendary: '59px',
		mythic: '47px'
	};

	initialize({ cloud_name: 'green-rabbit-holdings' });
	const source = nftData?.data.img || nftData?.data.video;
	const src = `GreenRabbit/nfts/${source}.png`;

	let innerWidth;
</script>

<svelte:window bind:innerWidth />
{#if nftData}
	<div class="wrapper" style="--rarity-color: {rarities[nftData.data.Rarity?.toLowerCase()]};">
		<div class="top">
			<div class="mint">#888</div>
			<img alt={nftData.data.name} use:image={{ src, lazy: true }} class="image" />
			<!-- <img
				
				alt="robot"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/QmdzDJ3eBwARsbK5VhK6fe6osjeYCiXfZCrjZNQ3ApWWue.png"
			/> -->
			{#if nftData.data.Rarity}
				<div
					class="rarity"
					style="border-color:{rarities[nftData.data.Rarity.toLowerCase()]};
			--width: {rarities[nftData.data.Rarity.toLowerCase()]}"
				>
					{nftData.data.Rarity.toLowerCase()}
				</div>
			{/if}
			<div class="collection" style="--width:{innerWidth < 1024 ? ' 66px' : '105px'}">
				greenrabbit
			</div>
		</div>
		<div class="bottom">
			<span>{nftData.name}</span>
			<CtaButton
				text="View on Atomichub"
				fontSize={innerWidth < 1024 ? '11px' : '14px'}
				width={innerWidth < 1024 ? '140px' : '180px'}
				height={innerWidth < 1024 ? '39px' : '45px'}
			/>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		min-width: 100px;
		max-width: 165px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 330px;
		max-height: 330px;
		position: relative;
		overflow: hidden;
		border-radius: 4px;

		background-image: linear-gradient(to bottom, #151515, #343434);
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
		height: calc(215px - 95px);
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
		margin-bottom: 6px;
	}
	.bottom span:first-of-type {
		margin-top: 12px;
	}
	.bottom span:not(:first-of-type) {
		color: var(--primary-teal);
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
		right: 10px;
		margin: 0 auto;
		width: var(--width);
		padding: 4px 8px;
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
		bottom: -15px;

		left: 10px;
		margin: 0 auto;
		width: var(--width);
		padding: 4px 8px;
		border: 2px solid var(--primary-teal);
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
			width: 40px;
		}

		.wrapper:before {
			margin: -30px;
			width: 60px;
			height: 60px;
		}
	}

	@media (min-width: 1024px) {
		.image {
			width: 100%;
			height: 100%;
		}
		.wrapper {
			max-height: 435px;
			max-width: 300px;
			height: 435px;
			width: 300px;
		}

		.top {
			height: calc(435px - 150px);
		}
		.bottom {
			height: 150px;
		}

		.mint {
			width: 75px;
			font-size: 16px;
		}

		.collection {
			left: 20px;
			bottom: -20px;
			font-size: 13px;
			padding: 6px 16px;
		}

		.rarity {
			right: 20px;
			bottom: -20px;
			padding: 6px 16px;
			font-size: 13px;
		}

		.bottom span {
			margin-bottom: 12px;
			font-size: 18px;
		}
	}
</style>
