<script>
	import { craftingState } from 'src/stores/store';

	export let cardType = '';
	export let nftData;

	export let type;
	export let slot;
	export let filterType;
	export let rarity = null;

	export let maxSelectCount = 1;
	export let recalculateFilledSlots = () => {};
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};
	export let boosting = false;
	export let addGp = () => {};
	import { getContext } from 'svelte';
	import InventoryMaster from '../overlays/InventoryMaster.svelte';
	const { openInventory } = getContext('notsimple-modal');
	function onOkay(asset) {
		if (!rarity || checkRarity(asset)) {
			addGp(asset, slot);
		} else window.pushToast('Asset must be of the same rarity', 'error', 'Rarity Missmatch', 6);
	}
	function checkRarity(assets) {
		for (let index = 0; index < assets.length; index++) {
			const element = assets[index];

			if (rarity != element.data.Rarity) return false;
		}
		return true;
	}

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
						hasForm: true,
						onOkay,
						inventoryType: filterType,
						maxSelectCount,
						boosting
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
							if (slot == 'slot1') {
								$craftingState[type][slot] = null;
								$craftingState[type]['slot2'] = null;
							} else $craftingState[type][slot] = null;
						}
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
		margin-top: 14px;
		text-align: center;
		font-weight: 600;
	}
	.rarity,
	.totem {
		width: 132px;
		height: 25px;
		border-radius: 19px;
		border: 1px solid var(--rarity-color);
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--is-disabled);
		text-transform: uppercase;
	}
	.rarity {
		margin-bottom: 4px;
	}
	.totem {
	}
	.bottom {
		margin-top: 10px;
	}
	.wrapper {
		position: relative;
		width: 150px;
		height: 242px;
		padding: 8px;
		border: solid 2px var(--border-color);
		background-color: #141414;
		cursor: pointer;
	}

	.image-placeholder {
		width: 130px;
		height: 120px;
		border: 2px dashed var(--greenish-cyan);
		display: flex;
	}
	.image {
		width: 130px;
		height: 120px;
		display: flex;
	}
	.image img {
		margin: 0 auto;
		object-fit: scale-down;
	}

	._placeholder {
		width: 24px;
		height: 24px;
		border: 2px solid var(--primary-teal);
		border-radius: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--primary-teal);
		position: relative;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
	}

	@media (min-width: 768px) {
		.wrapper {
			width: 235px;
			height: 340px;
			overflow: initial;
		}

		.remove {
			position: absolute;
			top: -25px;
			right: -30px;
		}
		.image-placeholder,
		.image {
			width: 205px;
			height: 205px;
			margin: 0 auto;
			position: relative;
		}
		.bottom-card-info {
			display: flex;
			margin-top: 20px;
			margin-bottom: 25px;
			justify-content: center;
		}
		.bottom-card-info div {
			margin: 0 5px;
		}
		._placeholder {
			width: 41px;
			height: 41px;
			font-size: 28px;
		}
	}
</style>
