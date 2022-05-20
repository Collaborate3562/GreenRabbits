<script>
	export let disabled = false;
	import { activeUser, modal, promoAssetsStore, promoCollectionsStore } from 'src/stores/store';
	import { PROMO_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import { getContext } from 'svelte';
	const { open, close } = getContext('simple-modal');
	async function unstakePromos() {
		let actions = [];
		open(AwaitingAuth);
		$promoCollectionsStore.forEach((col) => {
			let asset_ids = [];
			$promoAssetsStore.forEach((assets) => {
				if (assets.collection == col.collection) {
					assets.data.forEach((asset) => {
						if (asset.isSelected) asset_ids.push(asset.asset_id);
					});
				}
			});
			if (asset_ids.length) {
				actions.push({
					account: PROMO_CONTRACT,
					name: 'unstake',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName,
						collection: col.collection,
						asset_ids: asset_ids
					}
				});
			}
		});
		if (actions.length) {
			// setAwaitingConfirmation(1)
			let transaction = { actions };
			try {
				let res = await $activeUser.signTransaction(transaction, {
					broadcast: true,
					blocksBehind: 3,
					expireSeconds: 60
				});

				setTimeout(() => {
					window.refreshPromoAssets(false, 0, (e) => {
						if (e) close();
					});
				}, TRANSACTION_TIMEOUT_MS);
			} catch (err) {
				//addToast(err.message, { appearance: 'error' })
				close();

				//setAwaitingConfirmation(0)
				window.pushToast(err.message, 'error', 'Transaction error', 6);
			}
		}
	}
</script>

<div class="wrapper">
	<button
		on:click={() => {
			modal.set(AwaitingAuth);
			unstakePromos();
		}}
		class:disabled>UNSTAKE</button
	>
</div>

<style>
	.wrapper {
		background-color: black;

		position: sticky;
		width: 100%;
		bottom: 0;
		z-index: 10;
		height: 80px;
		display: flex;
		align-items: center;
	}
	button {
		/* REMOVE DEFAULT STYLE */
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;

		/* NEW STYLE */
		margin: 0 auto;
		padding: 14px;
		height: 45px;
		width: 170px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;

		font-size: 14px;
		border: solid 1px var(--primary-teal);
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
