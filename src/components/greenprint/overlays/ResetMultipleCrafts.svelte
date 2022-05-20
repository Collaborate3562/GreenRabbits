<script>
	import CtaButton from 'src/components/CTAButton.svelte';
	import AwaitingAuth from 'src/components/flashdrive/AwaitingAuth.svelte';
	import { activeUser, now, userBalance } from 'src/stores/store';
	import { CRAFTING_CONTRACT, TOKEN_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import { get_diff_hours_left } from 'src/utils/helpers';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { getContext } from 'svelte';

	const { open, close } = getContext('simple-modal');
	async function onPay() {
		if (!$activeUser.accountName) return;
		open(AwaitingAuth);

		/*  setAwaitingConfirmation(1) */
		let actions = [];
		for (let nftData of assets) {
			actions.push({
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: $activeUser.accountName,
					to: CRAFTING_CONTRACT,
					quantity: getAmount(nftData).toFixed(4) + ' SHELL',
					memo: 'cooldownfee|' + nftData.asset_id
				}
			});
		}
		let transaction = {
			actions
		};
		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			setTimeout(() => {
				window.refresh(false, 0, (e) => {
					if (e) close();
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			/*   addToast(err.message, { appearance: 'error' })
      setAwaitingConfirmation(0) /////////SHOW ERROR TOAST */
		}
	}
	export let onClose;
	export let end;
	export let weight;
	export let assets;
	let amount = 0;
	function getAmount(nftData) {
		return (
			get_diff_hours_left(
				Number(nftData.mutable_data['Last Used']) +
					3600 * (12 * Number(nftData.mutable_data['Status Type'])),
				$now
			) *
			2 *
			(nftData.weight / 10000)
		);
	}
	function getAmounts() {
		let tempAmount = 0;
		for (let nftData of assets) {
			tempAmount +=
				get_diff_hours_left(
					Number(nftData.mutable_data['Last Used']) +
						3600 * (12 * Number(nftData.mutable_data['Status Type'])),
					$now
				) *
				2 *
				(nftData.weight / 10000);
		}
		return tempAmount;
	}

	let insufficientSell;
	$: insufficientSell = $userBalance < amount;
	$: amount = getAmounts();
</script>

<div class="wrapper">
	<h1>Reset cooldown</h1>

	<div class="content">
		<div class="text">
			<p>
				Reset <span style="color:var(--primary-teal);">{assets.length} </span>{assets.length == 1
					? 'cooldown'
					: 'cooldowns'} for
			</p>
			<p class="currency">{toFixedCurrency(amount, 2)} SHELL</p>
			{#if insufficientSell}
				<p class="insufficient">Insufficient Shellinium</p>
			{/if}
		</div>
		<div class="buttons">
			<CtaButton
				disabled={insufficientSell}
				onClick={onPay}
				text="PAY AND RESET"
				width="280px"
				fontSize="16px"
				margin="0 0 16px 0"
			/>
			<CtaButton onClick={close} text="CANCEL" outlined width="280px" fontSize="16px" />
		</div>
	</div>
</div>

<style>
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
		padding: 16px;
	}

	.content {
		padding: 14px;
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
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
		align-items: center;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;

		margin-bottom: 30px;
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

	@media (min-width: 1024px) {
		.text {
			position: relative;
			top: -50px;
		}
	}
</style>
