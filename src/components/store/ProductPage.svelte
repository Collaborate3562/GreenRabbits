<script>
	import { activeUser, now, userBalance, waxBalance } from 'src/stores/store';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import {
		STORE_CONTRACT,
		TESTNET,
		TOKEN_CONTRACT,
		TRANSACTION_TIMEOUT_MS
	} from 'src/utils/config';
	import { slide, fade } from 'svelte/transition';
	import { getFormattedCost, getSaleImg } from 'src/utils/helpers';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import SaleTimer from '../SaleTimer.svelte';
	import Quantity from './Quantity.svelte';
	import UnpackButton from './UnpackButton.svelte';

	export let nftData;
	let selectedQuantity;

	import { getContext, onMount } from 'svelte';
	import SimpleModal from '../SimpleModal.svelte';
	import BackButton from '../staking/BackButton.svelte';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import WhitelistBanner from './WhitelistBanner.svelte';

	const { open, close } = getContext('shop-modal');
	const getTime = async () => {
		return await atomicAssetsApi.getTimestamp();
	};
	let dropEnded = false;
	let dropSoldOut = false;
	let dropUserMaxOut = false;
	let timer = true;
	let saleDescription = '';
	$: {
		dropEnded = hasDropEnded($now);
		dropSoldOut = !(nftData.maxcollect == 0) && nftData.collected >= nftData.maxcollect;
		try {
			saleDescription = JSON.parse(nftData.display_data).description || '';
		} catch {
			console.error('No sale description');
		}

		dropUserMaxOut =
			nftData.indivmax == 0 ? false : Number(nftData.userPurchased?.counter) >= nftData.indivmax;
	}
	$: currency = nftData.itemcost.split(' ')[1];
	function hasDropEnded(time) {
		if (!nftData.active) return true;
		if (nftData.endtime == 0) return false;
		if (nftData.endtime) {
			if (nftData.endtime < $now) return true;
		} else return false;
	}
	let whitelisted = nftData.whitelist;
	let isUserWhitelisted = false;
	let whitelistcheckDone = false;
	onMount(async () => {
		if (whitelisted) {
			if ($activeUser.accountName)
				isUserWhitelisted = await greenRabbitApi.fetchWlSales(
					STORE_CONTRACT,
					nftData.sale_id,
					$activeUser.accountName
				);
			whitelistcheckDone = true;
		}
	});
	async function handleBuy() {
		let actions = [];
		timer = false;
		if (currency == 'SHELL') {
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
					to: STORE_CONTRACT,
					quantity: (nftData.itemcost.split(' ')[0] * selectedQuantity).toFixed(4) + ' SHELL',
					memo: String(nftData.sale_id) + '|' + selectedQuantity
				}
			});
		} else {
			actions.push({
				account: 'eosio.token',
				name: 'transfer',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: $activeUser.accountName,
					to: STORE_CONTRACT,
					quantity: (nftData.itemcost.split(' ')[0] * selectedQuantity).toFixed(8) + ' ' + currency,
					memo: String(nftData.sale_id) + '|' + selectedQuantity
				}
			});
		}
		if (actions.length) {
			open(AwaitingAuth);
			let transaction = { actions };
			try {
				let res = await $activeUser.signTransaction(transaction, {
					broadcast: true,
					blocksBehind: 3,
					expireSeconds: 60
				});

				setTimeout(() => {
					setTimeout(() => {
						window.pushToast('Item purchased', 'success', 'Transaction success', 6);
						window.getStoreData(true, (e) => {
							close();
							window.refreshBalance();
						});
					}, TRANSACTION_TIMEOUT_MS);
				}, 1000);
			} catch (err) {
				timer = true;
				close();
				window.pushToast(err.message, 'error', 'Transaction error', 6);
			}
		}
	}

	let priceCheck;
	$: priceCheck =
		currency == 'SHELL'
			? Number($userBalance) < selectedQuantity * parseFloat(nftData.itemcost.split(' ')[0])
			: Number($waxBalance) < selectedQuantity * parseFloat(nftData.itemcost.split(' ')[0]);

	let startTime = nftData.starttime;
	$: active = nftData.active;
	$: {
		if (nftData) {
			if (nftData.individual_limit_cooldown > 0 && nftData.userPurchased?.last_buy_time) {
				startTime = nftData.individual_limit_cooldown + nftData.userPurchased?.last_buy_time;
			}
			timer = true;
		}
	}

	function getRemainingItems() {
		if (nftData.indivmax === 0) {
			return 'Unlimited';
		}

		let userCounter = nftData.userPurchased?.counter;

		if (!userCounter) {
			return nftData.indivmax;
		}

		if (nftData.indivmax - userCounter > 0) {
			return nftData.indivmax - userCounter;
		}

		return 0;
	}

	$: saleImg = getSaleImg(nftData);
</script>

<svelte:head>
	<title>{nftData.templateData?.name} | GreenRabbit Game</title>
</svelte:head>
<div
	style="width: 100%;
display: flex;

max-width: 1075px;
margin: 0 auto;
    margin-bottom: 0px;
margin-bottom: 31px;"
>
	<BackButton clearSelects={false} link="/store" width="158px" fontSize="16px" text="SHOP" />
</div>
{#if whitelisted && !isUserWhitelisted && whitelistcheckDone}
	<div style="margin-top:30px;"><WhitelistBanner /></div>
{/if}
<div class="wrapper">
	<div in:slide={{ delay: 450 }} class="image-container">
		<img
			class="image"
			alt={nftData.templateData?.name}
			src={'https://greenrabbit.mypinata.cloud/ipfs/' + saleImg}
		/>
	</div>

	<div class="product-wrapper">
		<div class="product-info">
			<p class="product-name" in:slide={{ delay: 450 }}>{nftData.templateData?.name}</p>
			<div class="available" in:slide={{ delay: 400 }}>
				{nftData.maxcollect > 0
					? `Total available: ${nftData.maxcollect - nftData.collected} / ${nftData.maxcollect}`
					: `Total claimed: ${nftData.collected} / Unlimited `}
			</div>

			<div class="price" in:slide={{ delay: 450 }}>
				<p>Price</p>
				<p class="shell-price">
					{getFormattedCost(nftData)}
					{currency}
				</p>
			</div>
		</div>
		<div class="pack-info">
			{#if $activeUser.accountName}
				<p class="remaining" in:slide={{ delay: 500 }}>
					<span>Your remaining items:</span>
					{getRemainingItems()}
				</p>
				<div class="purchase" in:slide={{ delay: 550 }}>
					<div class="total-price">
						<Quantity
							bind:selectedQuantity
							max={nftData.indivmax > 0
								? nftData.indivmax - nftData.userPurchased?.counter > 0
									? nftData.indivmax - nftData.userPurchased?.counter
									: 0
								: 99999999}
						/>
						<div class="shell">
							<p>Total price</p>
							<p class="shell-price">
								{getFormattedCost(nftData, selectedQuantity)}
								{currency}
							</p>
						</div>
					</div>
					<div in:fade={{ delay: 700, duration: 200 }}>
						<div class="sale-end">
							<div class="sale-end-inner">
								<SaleTimer
									id="end-time"
									buttonText={dropEnded
										? 'ended'
										: dropSoldOut
										? 'sold out'
										: dropUserMaxOut
										? 'max bought'
										: !active
										? 'Inactive'
										: 'buy'}
									start={nftData.starttime}
									end={nftData.endtime}
								/>
							</div>
						</div>
						{#if timer}
							<SaleTimer
								id="buyButton-timer"
								isButton
								initialMinute={0}
								initialSeconds={0}
								start={startTime}
								buttonText={dropEnded
									? 'ended'
									: dropSoldOut
									? 'sold out'
									: dropUserMaxOut
									? 'max bought'
									: !active
									? 'Inactive'
									: 'buy'}
								disabledFully={dropEnded ||
									dropSoldOut ||
									dropUserMaxOut ||
									priceCheck ||
									!active ||
									(whitelisted && !isUserWhitelisted)}
								end={nftData.endtime}
								width="192px"
								onClick={handleBuy}
							/>
						{/if}
						{#if priceCheck}
							<span class="shell-error"
								>Insufficient {currency == 'SHELL' ? 'Shellinium' : 'WAX'}</span
							>
						{/if}
					</div>
				</div>
			{:else}
				<p class="remaining" in:slide={{ delay: 500 }}>
					<span>You must be logged in to buy</span>
				</p>
			{/if}
		</div>
		{#if $activeUser.accountName && nftData.ownedAssets}
			<div in:slide={{ delay: 650 }}>
				{#if nftData.pack}
					<div class="unpack">
						<p>
							<span>You own: </span>{nftData.ownedAssets.data.length
								? nftData.ownedAssets.data[0].assets
								: 0}
						</p>
						<SimpleModal key="unpack-modal">
							<UnpackButton
								{nftData}
								disabled={nftData.ownedAssets.data.length ? !nftData.ownedAssets.data[0].assets : 1}
							/>
						</SimpleModal>
					</div>
				{/if}
				{#if nftData.templateData.immutable_data.Description}
					<div class="description">
						<p class="title">Description</p>
						<p class="text">
							{saleDescription}
							{nftData.templateData.immutable_data.Description}
						</p>
					</div>
				{/if}
				{#if nftData.templateData.immutable_data.description}
					<div class="description">
						<p class="title">Description</p>
						<p class="text">
							{saleDescription}
							{nftData.templateData.immutable_data.description}
						</p>
					</div>
				{/if}
			</div>{/if}
	</div>
</div>

<style>
	.wrapper {
		color: white;
	}
	.sale-end {
		position: relative;
		width: 0;
		height: 0;
	}
	.sale-end-inner {
		position: absolute;

		top: -55px;
	}
	.image-container {
		background-color: #111;
		width: 100%;
		height: 380px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.image-container .image {
		object-fit: contain;
		width: 245px;
		height: 295px;
	}

	.product-wrapper {
		padding: 24px;
		max-width: 450px;
		margin: 0 auto;
	}
	.product-name {
		font-size: 22px;
		font-weight: 900;
	}

	.available {
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 15px;
		color: var(--pure-white);
		border: solid 1px #fff;

		background-color: rgba(29, 29, 29, 0.86);
		border-radius: 25px;
		padding: 4px 8px;
		text-align: center;
		margin-top: 18px;

		max-width: 270px;
	}
	.product-info {
		padding-bottom: 34px;
		border-bottom: solid 1px rgba(255, 255, 255, 0.4);
	}
	.price {
		margin-top: 40px;
		font-size: 17px;
	}
	.price .shell-price {
		font-size: 22px;
		font-weight: bold;
		color: var(--primary-teal);
	}

	.unpack {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 175px;
		margin-top: 45px;
		border: solid 1px rgba(255, 255, 255, 0.4);
		padding: 34px 20px;
		font-size: 18px;
	}

	.unpack p span {
		font-weight: 900;
	}

	.total-price {
		display: flex;
		/* 	margin-bottom: 38px; */
	}

	.shell-error {
		margin-top: 8px;
		color: var(--danger);
	}
	.shell {
		margin-left: 14px;
	}

	.shell-price {
		color: var(--primary-teal);
	}

	.pack-info {
		margin-top: 34px;
	}

	.pack-info .remaining {
		font-size: 18px;
		margin-bottom: 28px;
	}
	.pack-info .remaining span {
		font-weight: 900;
	}

	.description {
		margin-top: 46px;
	}
	.description .title {
		font-size: 18px;
		font-weight: 900;
	}

	.description .text {
		margin-top: 10px;
	}

	@media (min-width: 1024px) {
		.wrapper {
			display: flex;
			max-width: 1075px;
			margin: 0 auto;
		}

		.product-wrapper {
			max-width: 620px;
			min-width: 620px;
		}
		.image-container {
			max-width: 405px;
		}

		.purchase {
			display: flex;
			justify-content: space-between;
		}

		.unpack {
			flex-direction: row;
			height: 95px;
			align-items: center;
			justify-content: space-between;
		}
		.pack-info {
			padding-right: 20px;
		}
	}
</style>
