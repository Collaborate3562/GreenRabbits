<script>
	import { promoAssetsStore } from 'src/stores/store';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { onDestroy } from 'svelte';

	import PromoCard from '../cards/PromoCard.svelte';
	import BackButton from '../staking/BackButton.svelte';
	import PromoStakeButton from './PromoStakeButton.svelte';
	import PromoUnstakeButton from './PromoUnstakeButton.svelte';

	let currentTab = 'Staking';
	function clearSelects() {
		$promoAssetsStore.forEach((e) => {
			e.data.forEach((element) => {
				element.isSelected = false;
			});
		});
	}
	function openTab(evt, tabName) {
		currentTab = tabName;
		clearSelects();
	}
	let selected = 0;
	let available = 0;
	let staked = 0;
	let power = 0;
	$: {
		if ($promoAssetsStore) {
			let tempPower = 0;
			let selectedTemp = 0;
			let stakedTemp = 0;
			let availableTemp = 0;
			$promoAssetsStore.forEach((e) => {
				e.data.forEach((element) => {
					if (element.schema.schema_name !== 'exclusives') {
						if (element.isSelected) selectedTemp++;
						if (element.isStaked && element.isStakeable) {
							stakedTemp++;
							tempPower += element.weight;
						} else if (element.isStakeable) availableTemp++;
					}
				});
			});
			selected = selectedTemp;
			available = availableTemp;
			staked = stakedTemp;
			power = tempPower;
		}
	}

	onDestroy(() => {
		clearSelects();
	});
</script>

<div class="wrapper">
	<div class="header">
		<div class="back-btn">
			<BackButton text="ALL FLASHDRIVES" clearSelects={false} />
		</div>
		<h1>Green Rabbit Promo Staking</h1>
		<div class="promo-info">
			<div class="available">
				<span class="title">Available for staking</span>
				<span class="info">{available}</span>
			</div>
			<div class="staked">
				<span class="title">Staked</span>
				<span class="info">{staked}</span>
			</div>
			<div class="generating">
				<span class="title">Generating per hour</span>
				<span class="info">{toFixedCurrency(power / 10000, 2)}</span>
			</div>
		</div>
	</div>
	<div class="tab">
		<div class="tab-wrap">
			<button
				class="tablinks"
				class:selected={currentTab === 'Staking'}
				on:click={(e) => openTab(e, 'Staking')}>AVAILABLE FOR STAKING</button
			>
			<button
				class="tablinks"
				class:selected={currentTab === 'Staked'}
				on:click={(e) => openTab(e, 'Staked')}>Staked</button
			>
		</div>
	</div>
	<div id="Staking" class="tabcontent" class:selected={currentTab === 'Staking'}>
		{#if available}
			<div class="grid">
				{#each $promoAssetsStore as collection, i}
					{#each $promoAssetsStore[i].data.filter((asset) => !asset.isStaked && asset.isStakeable && asset.schema.schema_name !== 'exclusives') as nftData}
						<div
							on:click={() => {
								nftData.isSelected = !nftData.isSelected;
							}}
						>
							<PromoCard {nftData} />
						</div>
					{/each}
				{/each}
			</div>
		{:else}
			<div class="no__items">
				<span
					style="  font-size: 24px;
				width:526px;text-align:center;
			font-weight: bold;"
					>You don’t have any Green Rabbit or nVen0m NFTS promos available for staking</span
				>
				<!-- <span
					style="  font-size: 18px;
			width:206px;text-align: center; margin-top:12px; opacity: 0.7;
			font-weight: normal;">Buy them on the market or get them from packs.</span
				> -->
			</div>
		{/if}
	</div>

	<div id="Staked" class="tabcontent" class:selected={currentTab === 'Staked'}>
		{#if staked}
			<div class="grid">
				{#each $promoAssetsStore as collection, i}
					{#each $promoAssetsStore[i].data.filter((asset) => asset.isStaked && asset.schema.schema_name !== 'exclusives') as nftData}
						<div
							on:click={() => {
								nftData.isSelected = !nftData.isSelected;
							}}
						>
							<PromoCard {nftData} />
						</div>
					{/each}
				{/each}
			</div>
		{:else}
			<div class="no__items">
				<span
					style="  font-size: 24px;
				width:386px;text-align:center;
			font-weight: bold;">You haven’t staked any Green Rabbit or nVen0m NFTS promos</span
				>
				<!-- 	<span
					style="  font-size: 18px;
			width:206px;text-align: center; margin-top:12px; opacity: 0.7;
			font-weight: normal;">Buy them on the market or get them from packs.</span
				> -->
			</div>
		{/if}
	</div>
	{#if currentTab == 'Staking'}
		<PromoStakeButton disabled={selected == 0 || currentTab != 'Staking'} />
	{:else}
		<PromoUnstakeButton disabled={selected == 0 || currentTab != 'Staked'} />
	{/if}
</div>

<style>
	.no__items {
		max-height: 920px;
		min-height: 920px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.header {
		color: var(--pure-white);
		margin: 102px auto 28px;
		padding: 0 18px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		max-width: 421px;
		position: relative;
	}
	.back-btn {
		position: absolute;
		top: 16px;
		left: 0;
	}

	.header h1 {
		font-size: 22px;
		margin-bottom: 28px;
	}

	.header .promo-info {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.header .promo-info div {
		flex-direction: column;
		display: flex;
		direction: rtl;
		justify-content: space-between;
	}

	.generating {
		flex: 0 0 115px;
	}
	.available {
		flex: 0 0 93px;
	}

	.header .info {
		color: var(--primary-teal);
	}
	.grid {
		position: relative;
		padding: 0 20px 40px;
		justify-items: center;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		max-height: 920px;
		min-height: 920px;
		overflow-y: auto;
	}

	.tab button {
		/* REMOVE DEFAULT STYLE */
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;

		/* NEW STYLE */

		color: white;
		font-size: 17px;
		text-transform: uppercase;
		max-width: 125px;
	}

	div > button.selected {
		font-weight: 900;
		border-bottom: 5px solid var(--primary-teal);
	}
	.tab {
		display: flex;
		justify-content: space-evenly;
		margin: 0 0;
		border-bottom: solid 1px #707070;
		margin-bottom: 32px;
	}
	.tab-wrap {
		width: 375px;
		display: flex;
		justify-content: space-evenly;
		min-height: 72px;
	}

	.tabcontent {
		display: none;
		color: white;
		overflow: hidden;
		max-width: 1100px;
		max-height: 920px;
		margin: 0 auto 32px;
		padding: 20px 0 0;
		border: 1px solid var(--primary-teal);
	}
	.tabcontent.selected {
		display: block;
	}

	@media (min-width: 575px) {
		.grid {
			grid-template-columns: 1fr 1fr 1fr;
		}

		.tabcontent {
			padding: 20px;
		}
	}
	@media (min-width: 768px) {
		.tab-wrap {
			max-width: 600px;
			justify-content: space-between;
		}
		.grid {
			grid-template-columns: 1fr 1fr 1fr 1fr;
		}

		.header {
			max-width: none;
			flex-direction: row;
		}
		.header h1 {
			font-size: 32px;
		}

		.back-btn {
			top: 0;
			bottom: 105px;
			top: auto;
		}
	}

	@media (min-width: 1024px) {
		.header {
			max-width: 1100px;
			padding: 0;
		}
		.promo-info {
			flex: 0 1 500px;
		}
		.promo-info div {
			height: 55px;
			flex: 1 0 auto;
		}
	}
</style>
