<script>
	import { getContext } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import { activeUser, allAssetsStore, driveAssetsStore } from 'src/stores/store';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	export let partner;
	const { closeInventory } = getContext('notsimple-modal');
	const { open, close } = getContext('simple-modal');
	const fcards = $driveAssetsStore.filter((asset) => asset.data.Class === 'Flashdrive');
	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};
	export let collection;

	$: selectedList = $driveAssetsStore.filter((asset) => asset.isSelected);

	async function stakeDrive() {
		if (selectedList.length) {
			if (!$activeUser.accountName) return;
			open(AwaitingAuth);
			let transaction = {
				actions: [
					{
						account: 'atomicassets',
						name: 'transfer',
						authorization: [
							{
								actor: $activeUser.accountName,
								permission: $activeUser.requestPermission
							}
						],
						data: {
							from: $activeUser.accountName,
							to: STAKING_CONTRACT,
							asset_ids: [selectedList[0].asset_id],
							memo: `equipdrives|${partner.collectionName}`
						}
					}
				]
			};

			try {
				let res = await $activeUser.signTransaction(transaction, {
					broadcast: true,
					blocksBehind: 3,
					expireSeconds: 60
				});

				setTimeout(() => {
					window.refreshFlashDrives(false, 0, (e) => {
						if (e) {
							closeInventory();
							close();
						}
					});
					window.getDrives();
				}, TRANSACTION_TIMEOUT_MS);
			} catch (err) {
				close();
				window.pushToast(err.message, 'error', 'Transaction error', 6);
			}
		}
	}
	async function clearSelects() {
		for (let asset of $driveAssetsStore) {
			asset.isSelected = false;
		}
	}
	const sizes = {
		common: 32,
		uncommon: 128,
		epic: 512,
		legendary: 2048,
		mythic: 4096
	};
</script>

<div
	class="wrapper"
	in:fly={{ x: 200, duration: 450, easing: quintInOut }}
	out:fly={{ x: 200, duration: 200, easing: quintInOut }}
>
	<div class="content">
		<div class="header">
			<h1 style="display:flex;">Inventory</h1>
			<h2>{partner.name} Flash Drives</h2>
			<div
				class="close"
				on:click={() => {
					clearSelects();
					closeInventory();
				}}
			/>
		</div>
		<div class="cards">
			{#if $driveAssetsStore.filter((asset) => asset.data.Class === 'Flashdrive' && asset.data.Collection == collection).length > 0}
				<div class="grid">
					{#each $driveAssetsStore.filter((asset) => asset.data.Class === 'Flashdrive' && asset.data.Collection == collection) as card}
						<div
							class="cardwrapper"
							on:click={() => {
								clearSelects();
								card.isSelected = !card.isSelected;
							}}
							class:selected={card.isSelected}
						>
							<div class="top" class:selectedBg={card.isSelected}>
								<div class="mint">#{card.template_mint}</div>
								<div class="imgShow">
									<img
										alt={card.data.name}
										src="https://ipfs.io/ipfs/{card.data.img}"
										class="image"
									/>
								</div>

								<div
									class="rarity"
									style="border-color:{rarities[card.data.Rarity.toLowerCase()]};"
								>
									{card.data.Rarity.toLowerCase()}
								</div>
								<div class="token">{collection}</div>
							</div>
							<div class="bottom">
								<span class="nft-name">{card.name}</span>
								<span class="capacity">{sizes[card.data.Rarity.toLowerCase()]} bits</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="grid-bottom">
					<button
						class="grid-select-btn"
						class:btn-disabled={selectedList.length == 0}
						on:click={stakeDrive}>select</button
					>
				</div>
			{:else}
				<div class="noassets">
					<span>Your Inventory is empty</span>
					<button on:click={() => {}} class="buy-drives"> buy flash drives </button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.wrapper {
		border-left: 1px solid var(--primary-teal);
		z-index: 1010;
		position: fixed;
		right: 0;
		top: 0;
		background-color: #000;
		color: white;
		max-width: 895px;
		width: 100%;
	}
	.grid {
		margin: 0 auto;
		position: relative;
		display: grid;
		justify-content: center;
		padding: 20px 10px;
		overflow-y: auto;
		grid-template-columns: repeat(auto-fit, minmax(195px, max-content));
		gap: 18px;
		margin-bottom: 50px;
	}
	.close {
		display: block;
		position: absolute;
		top: 35px;
		right: 20px;
		z-index: 1000;
		width: 25px;
		height: 25px;
		background: url('/assets/close.png');
		background-size: contain;
		box-shadow: 0 0 0 1px black;
		cursor: pointer;
	}
	.content {
		position: relative;
		height: 100%;
		background: #0d0d0d;
	}
	.content .header {
		padding: 30px 28px 20px;
		border-bottom: solid 1px #333;
	}
	.content .header h1 {
		font-size: 30px;
		font-weight: 900;
	}
	.content .header h2 {
		font-size: 23px;
		font-weight: 500;
	}
	.cards {
		height: calc(100vh - 131px);
		color: white;
		overflow-y: auto;
	}
	.noassets {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-size: 24px;
		font-weight: bold;
		text-align: center;
		min-height: 80vh;
	}
	.cardwrapper {
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		position: relative;
		overflow: hidden;
		height: 330px;
		width: 195px;
		max-height: 330px;
		max-width: 195px;
	}
	.cardwrapper:hover {
		box-shadow: 0 0 0 2px var(--primary-teal);
		cursor: pointer;
	}
	.selected {
		box-shadow: 0 0 0 3px var(--primary-teal) !important;
	}
	.top {
		height: 220px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-image: linear-gradient(to bottom, #151515, #343434);
		position: relative;
		display: flex;
		flex-direction: column;
		background-color: #343434;
	}
	.bottom {
		display: flex;
		flex-direction: column;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		justify-content: space-between;
		height: 110px;
		padding: 25px 10px;
	}
	.bottom span {
		width: 100%;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 14px;
	}
	.bottom .nft-name {
		color: var(--primary-teal);
		font-size: 16px;
		font-weight: 600;
	}
	.mint {
		position: absolute;
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 12px;
		color: var(--pure-white);
		width: 57px;
		height: 25px;
		border-radius: 25px;
		display: flex;
		justify-content: center;
		align-items: center;
		top: 12px;
		right: 12px;
	}
	.token {
		position: absolute;
		right: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		bottom: -15px;
		height: 25px;
		margin: 6px auto 0;
		width: 80px;
		border: 1px solid white;
		border-radius: 13px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		font-size: 12px;
		font-weight: 600;
	}
	.rarity {
		position: absolute;
		left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		bottom: -15px;
		height: 25px;
		margin: 6px auto 0;
		width: 80px;
		border: 1px solid white;
		border-radius: 13px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
		font-size: 12px;
		font-weight: 600;
	}
	.image {
		object-fit: scale-down;
		width: 140px;
		height: 170px;
	}
	.buy-drives {
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
		padding: 12px 35px;
		color: white;
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 900;
		margin-top: 25px;
		border: solid 1px var(--greenish-cyan);
		cursor: pointer;
	}
	.grid-bottom {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 15px;
		background: #171717;
	}
	.btn-disabled {
		opacity: 0.5;
	}
	.grid-select-btn {
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
		padding: 12px 35px;
		color: white;
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 900;
		border: solid 1px var(--greenish-cyan);

		cursor: pointer;
	}
	@media (max-width: 768px) {
		.close {
			top: 20px;
		}
		.content .header {
			padding: 15px 20px;
		}
		.content .header h1 {
			font-size: 25px;
		}
		.content .header h2 {
			font-size: 18px;
		}
		.grid {
			padding: 20px 0;
			grid-template-columns: repeat(auto-fit, minmax(155px, 165px));
			gap: 6px;
		}
		.cardwrapper {
			width: 155px;
			height: 300px;
		}
		.cards {
			height: calc(100vh - 96px);
		}
		.top {
			height: 185px;
		}
		.token {
			width: 90%;
			margin: 2px auto;
			left: 0;
			right: 0;
			bottom: -30px;
		}
		.rarity {
			width: 90%;
			margin: 2px auto;
			left: 0;
			right: 0;
			bottom: 0px;
		}
		.image {
			object-fit: scale-down;
			width: 95px;
			height: 135px;
		}
		.bottom {
			padding: 40px 5px 20px;
		}
		.bottom .nft-name {
			font-size: 14px;
		}
	}
</style>
