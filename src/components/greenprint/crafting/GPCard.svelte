<script>
	import { allAssetsStore, craftingState } from 'src/stores/store';
	import { image, initialize } from 'svelte-cloudinary';

	export let cardType = '';
	export let nftData = null;

	export let type;
	export let slot;
	export let filterType;
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	import { getContext } from 'svelte';
	import InventoryMaster from '../overlays/InventoryMaster.svelte';
	const { openInventory, closeInventory } = getContext('notsimple-modal');
	function onOkay(asset) {
		$craftingState[type][slot] = asset[0];
	}

	initialize({ cloud_name: 'green-rabbit-holdings' });

	let source = nftData?.data.img || nftData?.data.video;
	let src = `GreenRabbit/nfts/${source}.png`;

	let imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
	let showImage = true;

	$: source = nftData?.data.img || nftData?.data.video;
	export let boosting = false;

	$: if (boosting) {
		imageSource = `./assets/${source}`;
	} else {
		imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
	}

	$: imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
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
					/* $craftingState[type][slot] = $allAssetsStore[50]; */

					openInventory(InventoryMaster, {
						filterType,
						slot,
						hasForm: true,
						onOkay,
						cardType,
						type,
						boosting,
						showAll: true
					});
				}
			}}
		>
			<div class="_placeholder">+</div>
		</div>
	{:else}
		<div class="image">
			{#if $craftingState[type].status == 0}
				<div
					on:click={() => {
						if (nftData) {
							$craftingState[type][slot] = null;
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
			{#if filterType != 'orbs'}
				<div
					class="totem"
					style="--rarity-color:{nftData ? '#fff' : 'var(--grayed-out)'}; --is-disabled:{nftData
						? '#fff'
						: 'var(--grayed-out)'};"
				>
					{nftData ? nftData.totem : 'TOTEM'}
				</div>
			{/if}
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
