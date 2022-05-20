<script>
	import { activeUser, assetsStore } from 'src/stores/store';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	export let drive;
	export let partner;
	export let disabled = false;
	import { getContext } from 'svelte';
	const { open, close } = getContext('simple-modal');
	async function handleUnstake() {
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
					name: 'unstake',
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

<button
	on:click={() => {
		handleUnstake();
	}}
	class:disabled
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185.343 185.343">
		<defs />
		<path
			fill="white"
			d="M51.707 185.343a10.692 10.692 0 01-7.593-3.149 10.724 10.724 0 010-15.175l74.352-74.347L44.114 18.32c-4.194-4.194-4.194-10.987 0-15.175 4.194-4.194 10.987-4.194 15.18 0l81.934 81.934c4.194 4.194 4.194 10.987 0 15.175l-81.934 81.939a10.678 10.678 0 01-7.587 3.15z"
		/>
	</svg>
	UNSTAKE
</button>

<style>
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
		margin-right: 4px;
		top: -0.5px;
		transform: rotate(180deg);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
