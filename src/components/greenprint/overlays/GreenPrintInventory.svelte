<script>
	import { getContext, onMount } from 'svelte';
	import CTAButton from 'src/components/CTAButton.svelte';
	import FilterDropdown from 'src/components/FilterDropdown.svelte';
	import GreenprintCard from 'src/components/greenprint/GreenprintCard.svelte';
	import { slide, fly } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import { allAssetsStore, craftingState, isAssetsLoading, now } from 'src/stores/store';
	import LoaderDots from 'src/components/misc/LoaderDots.svelte';

	const { openInventory, closeInventory } = getContext('notsimple-modal');

	export let isCrafting = false;
	export let cardType;
	export let initialRarity;
	export let inventoryType = 'crafting';
	export let selectedType, selectedRarity, selectedTotem;
	export let slot = null;
	export let grfilter = null;
	export let onOkay = (data) => {};
	export let maxSelectCount = 1;
	export let boosting = false;
	export let craftType;
	export let showAll = false;
	let selectedSph = { name: 'All', id: 1, min: 0, max: 0 };
	let selectedStatus = { name: 'All', id: 1, matcher: 'All' };
	let rarityFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Common', id: 2, matcher: 'Common' },
		{ name: 'Uncommon', id: 3, matcher: 'Uncommon' },
		{ name: 'Epic', id: 4, matcher: 'Epic' },
		{ name: 'Legendary', id: 5, matcher: 'Legendary' },
		{ name: 'Mythic', id: 6, matcher: 'Mythic' }
	];
	let rarityFilterOrbs = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Common', id: 2, matcher: 'Common' },
		{ name: 'Uncommon', id: 3, matcher: 'Uncommon' },
		{ name: 'Epic', id: 4, matcher: 'Epic' },
		{ name: 'Legendary', id: 5, matcher: 'Legendary' }
	];
	let totemFilter = [
		{ name: 'All' },
		{ name: 'Cat' },
		{ name: 'Snake' },
		{ name: 'Turtle' },
		{ name: 'Rabbit' }
	];
	let statusFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Staked', id: 2, matcher: 'isStaked' },
		{ name: 'On cooldown', id: 3, matcher: 'onCooldown' },
		{ name: 'Available', id: 4, matcher: 'available' }
	];
	let inventoryRef;
	let isSelected = [];
	let showWithoutBonus = !boosting;

	$: selectedCount = $allAssetsStore.filter((asset) => asset.isSelected).length;
	$: maxSelected = selectedCount >= maxSelectCount;
	$: isSelected = $allAssetsStore.filter((asset) => asset.isSelected);
	$: {
		if (selectedRarity) {
			clearSelectsOnSubmit();
		}
	}
	function setRarity(index = 1) {
		selectedRarity = rarityFilter[index];
	}
	function clearSelectsOnSubmit() {
		$allAssetsStore.forEach((e) => {
			e.isSelected = false;
		});
		selectedCount = $allAssetsStore.filter((asset) => asset.isSelected).length;
	}

	function clearSelects() {
		if (maxSelectCount == 1) {
			$allAssetsStore.forEach((e) => {
				e.isSelected = false;
			});
			maxSelected = false;
		}
	}
	function isNotSelected(asset) {
		let selectedArray = [];
		if (craftType == 'orbFusionCrafting') {
			for (let index = 0; index < 5; index++) {
				const element = $craftingState.orbFusionCrafting[`slot${index + 1}`];
				if (element) {
					selectedArray.push(element.asset_id);
				}
			}
		} else {
			for (let index = 0; index < 10; index++) {
				const element = $craftingState.fusionCrafting[`slot${index + 1}`];
				if (element) {
					selectedArray.push(element.asset_id);
				}
			}
		}
		return !selectedArray.includes(asset.asset_id);
	}

	function filterCheck(asset) {
		const check =
			(selectedTotem
				? asset.data.Totem == selectedTotem.name || selectedTotem.name == 'All'
				: true) &&
			(inventoryType == 'greenprint'
				? showWithoutBonus
					? asset.bonusStats?.total == 0
					: true
				: true) &&
			(selectedRarity
				? asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All'
				: true) &&
			(asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') &&
			((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) ||
				selectedSph.name == 'All');

		return check;
	}

	function sortAssets(a, b) {
		if (boosting) {
			if (
				(a.bonusStats?.total || 0) - (b.bonusStats?.total || 0) > 0 ||
				(a.data['Boost Count'] || 0) - (b.data['Boost Count'] || 0) > 0
			)
				return -1;
			else return 1;
		} else if (craftType == 'fusionCrafting') {
			if (
				(a.bonusStats?.total || 0) - (b.bonusStats?.total || 0) > 0 ||
				(a.data['Boost Count'] || 0) - (b.data['Boost Count'] || 0) > 0
			)
				return 1;
			else return -1;
		} else return 0;
	}
	async function trySelect(nftData, toggle = true) {
		if (!(initialRarity ? initialRarity.matcher != selectedRarity.matcher : false)) {
			clearSelects();
			if (!nftData.isStaked) {
				if (
					!nftData.mutable_data['Last Used'] ||
					Number(nftData.mutable_data['Last Used']) +
						3600 * (12 * Number(nftData.mutable_data['Status Type'])) -
						$now <
						0
				) {
					if (boosting && inventoryType == 'greenprint') {
						if (nftData.mutable_data['Boost Count'] && nftData.mutable_data['Boost Count'] >= 10) {
							nftData.isSelected = false;
						} else {
							if (toggle) nftData.isSelected = !nftData.isSelected;
							else nftData.isSelected = true;
						}
					} else {
						if (maxSelected) {
							nftData.isSelected = false;
						} else {
							if (toggle) nftData.isSelected = !nftData.isSelected;
							else nftData.isSelected = true;
						}
					}
				}
			}
		}
		$allAssetsStore.filter((asset) => asset.asset_id == nftData.asset_id)[0] = nftData;
		$allAssetsStore = $allAssetsStore;
	}
	async function selectFirstTen() {
		const assets = $allAssetsStore
			.filter(
				(asset) =>
					(selectedTotem
						? asset.data.Totem == selectedTotem.name || selectedTotem.name == 'All'
						: true) &&
					(inventoryType == 'greenprint'
						? showWithoutBonus
							? asset.bonusStats?.total == 0
							: true
						: true) &&
					(selectedRarity
						? asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All'
						: true) &&
					(asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') &&
					((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) ||
						selectedSph.name == 'All')
			)
			.sort(sortAssets);
		for (let index = 0; index < 10; index++) {
			var element = assets[index];
			trySelect(element, false);
		}
		$allAssetsStore.filter((asset) => asset.asset_id == nftData.asset_id)[0] = nftData;
		$allAssetsStore = $allAssetsStore;
	}

	async function selectFirstFive() {
		const assets = $allAssetsStore
			.filter(
				(asset) =>
					(selectedTotem
						? asset.data.Totem == selectedTotem.name || selectedTotem.name == 'All'
						: true) &&
					(selectedRarity
						? asset.data.Rarity == selectedRarity.matcher || selectedRarity.matcher == 'All'
						: true) &&
					(asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') &&
					((asset.weight / 10000 >= selectedSph.min && asset.weight / 10000 <= selectedSph.max) ||
						selectedSph.name == 'All')
			)
			.sort(sortAssets);
		for (let index = 0; index < 5; index++) {
			var element = assets[index];
			trySelect(element, false);
		}
	}

	$: {
		if (selectedRarity) $allAssetsStore = $allAssetsStore;
	}
	$: {
		if (selectedTotem) $allAssetsStore = $allAssetsStore;
	}
	if (showAll) setRarity(0);
</script>

<div
	bind:this={inventoryRef}
	class="wrapper"
	in:fly={{ x: 200, duration: 450, easing: quintInOut }}
	out:fly={{ x: 200, duration: 200, easing: quintInOut }}
>
	<div class="content">
		<div class="header">
			<h1 style="display:flex;">
				Inventory <div
					on:click={() => {
						if (!$isAssetsLoading) window.refreshAssets(false, 0, (e) => {});
					}}
					class="refreshIconWrap"
				>
					<img
						class="refreshIcon"
						class:refreshIconLoading={$isAssetsLoading}
						src="/icons/refresh.svg"
						alt=""
					/>
				</div>
			</h1>
			<h2>{' '}</h2>
			<div class="close" on:click={() => closeInventory()} />
			<div class="filter-desktop">
				{#if selectedRarity}
					<div class="flex">
						<FilterDropdown
							width="180px"
							text="Rarity"
							bind:selected={selectedRarity}
							filterItems={craftType == 'orbFusionCrafting' ? rarityFilterOrbs : rarityFilter}
						/>
						{#if inventoryType == 'greenprint'}
							<FilterDropdown
								width="180px"
								text="Totem"
								bind:selected={selectedTotem}
								filterItems={totemFilter}
							/>
						{/if}
					</div>
					{#if inventoryType == 'greenprint'}
						<div class="showOnSale">
							<label class="container">
								<input type="checkbox" bind:checked={showWithoutBonus} />
								<span class="checkmark" class:empty={!showWithoutBonus} />
							</label>
							<label for="showOnSale">Exclude GPs with bonus stats</label>
						</div>
					{/if}
				{/if}
			</div>
		</div>
		<div class="cards">
			{#if $isAssetsLoading}<div class="filter-rarity-block"><LoaderDots /></div>{:else}
				{#if !selectedRarity}
					<div class="filter-rarity-block">
						<h5>Choose rarity</h5>
						<div class="filter-rarity-items">
							<button class="rarity-item" on:click={() => setRarity(0)}>ALL</button>
							<button class="rarity-item" on:click={() => setRarity(1)}>COMMON</button>
							<button class="rarity-item" on:click={() => setRarity(2)}>UNCOMMON</button>
							<button class="rarity-item" on:click={() => setRarity(3)}>EPIC</button><br />
							<button class="rarity-item" on:click={() => setRarity(4)}>LEGENDARY</button>
							{#if craftType != 'orbFusionCrafting'}
								<button class="rarity-item" on:click={() => setRarity(5)}>MYTHIC</button>{/if}
						</div>
					</div>
				{/if}
				{#if selectedRarity}
					<div class="grid">
						{#if selectedSph && selectedType}
							{#each $allAssetsStore
								.filter(
									(asset) =>
										(selectedTotem
											? asset.data.Totem == selectedTotem.name || selectedTotem.name == 'All'
											: true) &&
										(inventoryType == 'greenprint'
											? showWithoutBonus
												? asset.bonusStats?.total == 0
												: true
											: true) &&
										(selectedRarity
											? asset.data.Rarity == selectedRarity.matcher ||
											  selectedRarity.matcher == 'All'
											: true) &&
										(asset.data.Class == selectedType.matcher || selectedType.matcher == 'All') &&
										((asset.weight / 10000 >= selectedSph.min &&
											asset.weight / 10000 <= selectedSph.max) ||
											selectedSph.name == 'All')
								)
								.sort(sortAssets) as nftData (nftData.asset_id)}
								{#if isNotSelected(nftData)}
									<div
										style="height: 330px;"
										on:click={() => {
											selectedCount = $allAssetsStore.filter((asset) => asset.isSelected).length;
											maxSelected = selectedCount >= maxSelectCount;

											trySelect(nftData);
										}}
									>
										<GreenprintCard
											{nftData}
											disabled={initialRarity
												? initialRarity.matcher != nftData.data.Rarity
												: false}
										/>
									</div>
								{/if}
							{:else}
								<div class="noassets">Your Inventory is empty</div>
							{/each}
						{/if}
					</div>
				{/if}
			{/if}
		</div>

		<div class="greenprint-footer" in:slide={{ duration: 200, delay: 500 }}>
			{#if $isAssetsLoading}<LoaderDots />{:else if selectedRarity}
				<div class="foot-group1">
					<div
						style="margin-right:30px;  font-size: 15px;
			font-weight: bold;text-transform:uppercase;display: flex;
			justify-content: center;
			align-content: center;
			align-items: center;
			height: 50px;"
					>
						{selectedCount}/{maxSelectCount}
						{inventoryType == 'greenprints' ? 'Greenprints selected' : 'Selected'}
					</div>
				</div>
				<div class="foot-group2">
					{#if craftType == 'fusionCrafting' && selectedRarity.matcher != 'All'}
						<div
							class="refreshButton"
							on:click={() => {
								selectFirstTen();
							}}
						>
							Auto-select
						</div>
					{/if}
					{#if craftType == 'orbFusionCrafting' && selectedRarity.matcher != 'All'}
						<div
							class="refreshButton"
							on:click={() => {
								selectFirstFive();
							}}
						>
							Auto-select
						</div>
					{/if}
					<CTAButton
						disabled={isSelected.length == 0}
						onClick={() => {
							clearSelectsOnSubmit();
							onOkay(isSelected);
							closeInventory();
						}}
						width="213px"
						fontSize="16px"
						text={inventoryType == 'greenprints' ? 'LOAD GREENPRINTS' : 'SELECT'}
					/>

					<!-- <CTAButton
					onClick={() => {
						window.refreshAssets(false, 0, (e) => {});
					}}
					width="213px"
					fontSize="16px"
					text="refresh"
				/> -->
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.refreshIconWrap {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 14px;
		cursor: pointer;
	}
	.refreshIcon {
		object-fit: scale-down;
		height: 26px;
		width: 26px;
	}
	.refreshIconWrap:hover {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.refreshIconLoading {
		opacity: 0.3;
		cursor: initial;
	}
	.foot-group2 {
		display: flex;
		align-items: center;
	}
	.refreshButton {
		font-size: 17px;

		font-weight: bold;

		font-stretch: normal;

		font-style: normal;

		line-height: normal;

		letter-spacing: normal;

		text-align: center;

		color: #36ffc0;
		cursor: pointer;
		margin-left: 35px;
		margin-right: 35px;
	}
	.noassets {
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: Lato;
		font-size: 24px;
		font-weight: bold;
		text-align: center;
		min-height: 500px;
	}
	.showOnSale {
		display: flex;
		margin-left: 24px;
		margin-top: 15px;
	}
	.showOnSale .container {
		margin-right: 10px;
	}
	.container {
		display: block;
		position: relative;
		padding-left: 24px;
		margin-bottom: 12px;
		cursor: pointer;
		font-size: 22px;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	/* Hide the browser's default checkbox */
	.container input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}
	/* Create a custom checkbox */
	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 25px;
		width: 25px;
		background-color: #36ffc0;
		border: 1px solid #36ffc0;
	}
	.empty {
		background-color: black !important;
	}
	/* Create the checkmark/indicator (hidden when not checked) */
	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}
	/* Show the checkmark when checked */
	.container input:checked ~ .checkmark:after {
		display: block;
	}
	/* Style the checkmark/indicator */
	.container .checkmark:after {
		left: 6px;
		top: 2px;
		width: 10px;
		height: 15px;
		border: solid #000;
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		transform: rotate(45deg);
	}
	.content .header {
		padding: 44px 28px 0px;
		border-bottom: solid 1px #333;
	}
	.content .header h1 {
		font-size: 30px;
		font-weight: 900;
	}
	.content .header h2 {
		font-size: 23px;
		font-weight: 600;
		margin-bottom: 55px;
	}
	.filter-desktop {
		display: flex;
	}
	.content {
		position: relative;
		height: 100%;
		background: #0d0d0d;
	}
	.cards {
		height: 100vh;
		color: white;
		padding-bottom: 135px;
		overflow: scroll;
	}
	.greenprint-footer {
		width: 100%;
		max-width: 895px;
		height: 100%;
		position: fixed;
		z-index: 1001;
		bottom: 0;
		height: 130px;
		box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.27);
		background-color: #171717;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.wrapper {
		border-left: 1px solid var(--primary-teal);
		z-index: 1010;
		position: fixed;
		right: 0;
		top: 0;
		background-color: #000;
		color: white;
		width: 895px;
	}
	.grid {
		margin: 0 auto;
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(155px, 165px));
		gap: 6px;
		justify-content: center;
		padding: 20px 0 110px;
		margin-bottom: 50px;
		overflow-y: auto;
	}
	.close {
		display: block;
		box-sizing: border-box;
		position: absolute;
		z-index: 1000;
		top: 1rem;
		right: 1rem;
		margin: 0;
		padding: 0;
		width: 29px;
		height: 29px;
		border: 0;
		color: black;
		border-radius: 1.5rem;
		background: url('/assets/close.png');
		background-size: contain;
		box-shadow: 0 0 0 1px black;
		transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
			background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
		-webkit-appearance: none;
		position: absolute;
		top: 50px;
		right: 50px;
		cursor: pointer;
	}
	.filter-rarity-block {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.filter-rarity-items {
		text-align: center;
		margin-top: 30px;
		padding-bottom: 140px;
	}
	.rarity-item {
		color: var(--greenlight_cyan);
		border: 1px solid var(--greenlight_cyan);
		border-radius: 19px;
		width: 130px;
		text-align: center;
		font-size: 14px;
		height: 32px;
		margin-left: 10px;
		margin-right: 10px;
		margin-bottom: 14px;
		margin-top: 14px;
		font-weight: bold;
		background: #1d1d1d;
		cursor: pointer;
	}
	.rarity-item:hover {
		background-color: #333;
	}
	.flex {
		display: flex;
	}
	@media (min-width: 1024px) {
		.wrapper {
			display: block;
		}
		.grid {
			grid-template-columns: repeat(auto-fit, minmax(195px, max-content));
			gap: 18px;
			margin-bottom: 50px;
		}
		.refreshButton {
			font-size: 17px;

			font-weight: bold;

			font-stretch: normal;

			font-style: normal;

			line-height: normal;

			letter-spacing: normal;

			text-align: center;

			color: #36ffc0;
			cursor: pointer;
			margin-left: 35px;
			margin-right: 35px;
		}
		.refreshButton:hover {
			color: rgb(53, 173, 135);
		}
		.greenprint-footer {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: row;
			height: 80px;
		}
		.foot-group2 {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-content: center;
			align-items: center;
		}
	}
	@media (max-width: 900px) {
		.wrapper {
			width: 90%;
		}
	}
	@media (max-width: 768px) {
		.wrapper {
			width: 100%;
		}
		.filter-desktop {
			flex-direction: column;
			align-items: flex-start;
		}
		.content .header {
			padding: 20px;
			padding-bottom: 5px;
		}
		.close {
			top: 25px;
			right: 20px;
		}
		.showOnSale {
			margin-left: 0;
		}
	}
</style>
