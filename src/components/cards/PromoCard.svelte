<script>
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';

	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};
	export let rarityColor = 'common';
	export let nftData;
</script>

{#if nftData}
	<div
		class="wrapper"
		class:selected={nftData.isSelected}
		style="--rarity-color: {rarities[rarityColor]};"
	>
		<div class="top">
			<div class="mint">#{nftData.template_mint}</div>
			<img
				class="image"
				alt="robot"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/{nftData
					.data.img}.png"
			/>
			<div class="collection" style="border-color: var(--primary-teal);}">
				{nftData.collection.collection_name}
			</div>
		</div>
		<div class="bottom">
			<span>{nftData.name}</span>
			<span>{toFixedCurrency(nftData.weight / 10000, 2)} shell/hr</span>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		min-width: 160px;
		max-width: 267px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 260px;
		max-height: 275px;
		position: relative;
		overflow: hidden;
	}
	.selected {
		box-shadow: 0 0 0 3px var(--primary-teal) !important;
	}
	.wrapper:before {
		/* 	content: '';
		position: absolute;
		margin: -25px;
		width: 50px;
		height: 50px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
		z-index: 3; */
	}

	.top {
		height: calc(255px - 102px);
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
		height: 102px;
		background-color: var(--dark-grey);
		bottom: 0;
		padding: 0 8px 0;
	}
	.bottom span {
		width: 100%;
		text-align: center;
		overflow: hidden;
	}
	.bottom span:first-of-type {
		margin-top: 12px;
		color: var(--primary-teal);
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
		right: 10px;
		margin: 0 auto;
		width: min-content;
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
		width: min-content;
		padding: 4px 8px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.image {
		object-fit: scale-down;
		width: 100px;
		height: 140px;
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

	@media (min-width: 768px) {
		.wrapper {
			max-width: 237px;
		}
	}

	@media (min-width: 1024px) {
		.wrapper {
			width: 237px;
			max-height: 400px;
			height: 400px;
		}
		.bottom {
			height: 136px;
		}
		.top {
			height: calc(400px - 136px);
		}

		.image {
			height: 210px;
			width: 150px;
		}
		.collection {
			left: 30px;
		}
		.rarity {
			right: 30px;
		}
	}
</style>
