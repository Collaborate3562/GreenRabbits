<script>
	import NftCard from 'src/components/cards/NFTCard.svelte';
	import CtaButton from 'src/components/CTAButton.svelte';
	import AuxCard from '../crafting/AuxCard.svelte';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { assetsStore } from 'src/stores/store';

	let selectedRarity;
	let insufficientSell = 100 < 200;
</script>

<div class="wrapper">
	<h1>Inventory</h1>

	<div class="content">
		<div class="staking-inventory">
			<!-- {#each $assetsStore.filter((asset) => asset.isStaked == null && asset.isStakeable && (asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All') && (asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') && ((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) || selectedSph.name == 'All')) as nftData} -->
			<!-- {#each $assetsStore as nftData, i}
				<div>
					<AuxCard {nftData} />
				</div>
			{/each} -->
			<AuxCard nftData={$assetsStore[0]} />
		</div>
		<div class="buttons">
			<CtaButton text="SELECT" width="280px" fontSize="16px" margin="0 0 0 0" />
		</div>
	</div>
</div>

<style>
	.staking-inventory {
		position: relative;
		min-width: 330px;
		max-width: 620px;
		display: grid;
		margin: 0 auto;
		justify-content: center;
		grid-template-columns: repeat(2, minmax(160px, 165px));
		row-gap: 8px;
		column-gap: 8px;
		padding: 8px;
		margin-top: 200px;
		height: 50vh;
		min-height: 700px;
		max-height: 700px;
		overflow-y: scroll;

		border-top: none;
	}
	.wrapper {
		color: white;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	h1 {
		font-size: 22px;
		font-weight: 900;
		padding: 15px 40px 40px;
	}

	.content {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.text {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.buttons {
		display: flex;
		flex-direction: column;
		align-self: flex-end;
		justify-content: center;
		align-items: center;
		width: 100%;
		background-color: #171717;
		height: 100px;
		z-index: 100;
		position: sticky;
		bottom: -16px;
		padding: 20px 0;
	}

	.wrapper p {
		font-size: 22px;
	}

	.wrapper p.insufficient {
		color: var(--danger);
		font-size: 14px;
	}
	.currency {
		font-weight: 600;
		color: var(--primary-teal);
		margin-top: 10px;
	}

	@media (min-width: 768px) {
		.staking-inventory {
			grid-template-columns: repeat(4, minmax(160px, 165px));
			gap: 10px;
			max-width: 100vw;
			margin-top: 0;
		}
	}

	@media (min-width: 1024px) {
		.staking-inventory {
			grid-template-columns: repeat(4, minmax(160px, 165px));
			gap: 10px;
			max-width: 100vw;
			margin-top: 0;
		}
	}
</style>
