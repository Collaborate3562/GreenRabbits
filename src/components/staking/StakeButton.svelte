<script>
	import { isDataLoading, lastSelected } from 'src/stores/store';

	import { activeUser, assetsStore } from 'src/stores/store';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	export let drive;
	export let selected;
	export let partner;
	export let disabled = false;
	import { getContext } from 'svelte';
	const { open, close } = getContext('simple-modal');
	async function handleStake() {
		if (!$activeUser) return;
		open(AwaitingAuth);
		let asset_ids = [];

		$assetsStore
			.filter((asset) => asset.isSelected == true)
			.forEach((e) => {
				asset_ids.push(e.asset_id);
			});

		let transaction = {
			actions: [
				{
					account: STAKING_CONTRACT,
					name: 'stake',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName,
						drive_id: drive.asset_id,
						asset_ids: asset_ids
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
				window.refreshAssets(false, 0, (e) => {
					if (e) {
						close();
					}
				});
				if (partner) {
					window.getDrives();
				}
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
</script>

<span class="_tooltip">
	<button
		on:click={() => {
			handleStake();
		}}
		class:disabled
		>STAKE
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185.343 185.343">
			<defs />
			<path
				fill="white"
				d="M51.707 185.343a10.692 10.692 0 01-7.593-3.149 10.724 10.724 0 010-15.175l74.352-74.347L44.114 18.32c-4.194-4.194-4.194-10.987 0-15.175 4.194-4.194 10.987-4.194 15.18 0l81.934 81.934c4.194 4.194 4.194 10.987 0 15.175l-81.934 81.939a10.678 10.678 0 01-7.587 3.15z"
			/>
		</svg>
	</button>
	{#if disabled}
		<span class="tooltiptext"
			>{selected > 0 && $lastSelected == 'staking'
				? 'You don’t have enough storage to stake the selected NFTs'
				: 'No NFTs selected!'}</span
		>
	{/if}
</span>

<style>
	._tooltip {
		position: relative;
		display: inline-block;
		border-bottom: 1px dotted black;
	}

	._tooltip .tooltiptext {
		visibility: hidden;
		/* height: 55px; */
		width: 230px;
		background-color: #fff;
		color: #000;
		text-align: center;
		padding: 5px 0;
		position: absolute;
		z-index: 1;
		bottom: 125%;
		left: 5%;
		margin-left: -60px;
		opacity: 0;
		transition: opacity 0.3s;
		font-size: 14px;
	}

	._tooltip .tooltiptext::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -10px;
		border-width: 10px;
		border-style: solid;
		border-color: #fff transparent transparent transparent;
	}

	._tooltip:hover .tooltiptext {
		visibility: visible;
		opacity: 1;
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
		height: 50px;
		width: 120px;
		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 14px;
		border: solid 1px var(--primary-teal);
		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}
	svg {
		position: relative;
		width: 12px;
		margin-left: 4px;
		top: -1px;
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
