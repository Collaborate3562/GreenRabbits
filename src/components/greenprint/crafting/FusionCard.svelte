<script>
	import { craftingState } from 'src/stores/store';
	import { initialize } from 'svelte-cloudinary';

	export let cardType = '';
	export let nftData;

	export let type;
	export let slot;
	export let filterType;
	export let rarity = null;
	export let maxSelectCount = 10;
	export let recalculateFilledSlots = () => {};
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};
	export let addGp = () => {};
	import { getContext } from 'svelte';
	import InventoryMaster from '../overlays/InventoryMaster.svelte';
	const { openInventory } = getContext('notsimple-modal');
	function onOkay(asset) {
		if (!rarity || checkRarity(asset)) {
			addGp(asset);
		} else window.pushToast('Asset must be of the same rarity', 'error', 'Rarity Missmatch', 6);
	}
	function checkRarity(assets) {
		for (let index = 0; index < assets.length; index++) {
			const element = assets[index];

			if (rarity != element.data.Rarity) return false;
		}
		return true;
	}
	initialize({ cloud_name: 'green-rabbit-holdings' });

	$: imageSource = nftData
		? `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${
				nftData.data.img || nftData.data.video
		  }.png`
		: '';
</script>

<div
	class="wrapper unselectable"
	style="--border-color:{nftData ? 'var(--primary-teal)' : 'rgba(54, 255, 192, 0.5)'};"
>
	{#if !nftData}
		<div
			class="image-placeholder"
			on:click={() => {
				if (!nftData) {
					openInventory(InventoryMaster, {
						filterType,
						rarity,
						initialRarity: rarity,
						slot,
						cardType,
						hasForm: true,
						onOkay,
						inventoryType: 'greenprint',
						craftType: type,
						maxSelectCount
					});
				}
			}}
		>
			<img class="_placeholder" src="/icons/img-placeholder.svg" alt="" />
		</div>
	{:else}
		<div class="image">
			{#if $craftingState[type].status == 0}
				<div
					on:click={() => {
						if (nftData) {
							$craftingState[type][slot] = null;
						}
						recalculateFilledSlots();
					}}
					class="remove"
				>
					<img alt="Close button" src="/icons/close-btn.svg" />
				</div>{/if}
			<img alt={nftData.data.name} src={imageSource} class="image" />
		</div>
	{/if}
	<div class="bottom">
		<div class="bottom-card-info">
			<div
				class="rarity"
				style="--rarity-color:{nftData
					? rarities[nftData.data.Rarity.toLowerCase()]
					: 'var(--grayed-out)'}; --is-disabled:{nftData ? '#fff' : 'var(--grayed-out)'}; "
			>
				{nftData ? nftData.data.Rarity : 'RARITY'}
			</div>
		</div>
		<p class="card-type">{cardType}</p>
	</div>
</div>

<style>
	.remove {
		position: absolute;
		z-index: 1;
		top: 10px;
		right: 10px;
		border-radius: 50px;
		color: var(--primary-teal);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.card-type {
		font-size: 14px;
		margin-top: 11px;
		text-align: center;
		font-weight: 600;
	}
	.rarity {
		width: 101px;
		height: 25px;
		border-radius: 12px;
		border: 1px solid var(--rarity-color);
		font-size: 11px;
		text-align: center;
		color: var(--is-disabled);
		text-transform: uppercase;
		background-color: #1d1d1d;
		z-index: 1;
		margin: auto;
		padding-top: 4px;
	}
	.wrapper {
		position: relative;
		width: 139px;
		height: 236px;
		border: solid 1px var(--greenlight_cyan);
		cursor: pointer;
		padding: 9px 2px 14.3px 2px;
		background-color: #141414;
		margin: auto;
		z-index: 1;
	}

	.image-placeholder {
		border: 2px dashed var(--greenish-cyan);
		margin: 0 auto;
		padding: 69px 44px 71px 45px;
	}
	.image-placeholder,
	.image {
		width: 121px;
		height: 172px;
		margin: 0 auto;
		position: relative;
		display: flex;
	}
	.image img {
		margin: 0 auto;
		object-fit: scale-down;
	}
	.bottom-card-info {
		display: flex;
		margin-top: -14px;
	}
	@media (min-width: 768px) {
		.wrapper {
			width: 139px;
			height: 236px;
			overflow: initial;
		}

		.remove {
			position: absolute;
			top: -25px;
			right: -30px;
		}
		._placeholder {
			width: 32px;
			height: 32px;
			object-fit: contain;
		}
	}
</style>
