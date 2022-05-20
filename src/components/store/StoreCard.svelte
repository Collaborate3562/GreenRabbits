<script>
	import { now } from 'src/stores/store';
	import { goto } from '$app/navigation';
	import { numberWithCommas, getFormattedCost, getSaleImg } from 'src/utils/helpers';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';

	import BuyButton from './BuyButton.svelte';
	import { TESTNET } from 'src/utils/config';
	export let nftData;
	let errorMsg = 'Buy limit reached'; // "Insufficient Shellinium"

	function getBuyDisabled(nftData) {
		if (nftData.pack) return false;
		if (nftData.collected === nftData.maxcollect) {
			if (nftData.maxcollect != 0) return true;
		}

		if (nftData.endtime > 0 && nftData.endtime < $now) {
			return true;
		}

		return false;
	}

	function getBuyButtonText(nftData) {
		if (nftData.pack && !nftData.active) return 'OPEN PACK';
		if (nftData.collected === nftData.maxcollect) {
			if (nftData.maxcollect != 0) return 'SOLD OUT';
		}

		if (nftData.endtime > 0 && nftData.endtime < $now) {
			return 'SALE ENDED';
		}

		return 'VIEW SALE';
	}

	$: currency = nftData.itemcost.split(' ')[1];

	$: saleImg = getSaleImg(nftData);
</script>

{#if nftData}
	<div class="wrapper">
		<div class="top">
			<div class="mint">
				{nftData.maxcollect > 0
					? `Total available: ${nftData.maxcollect - nftData.collected} / ${nftData.maxcollect}`
					: `Total claimed: ${nftData.collected} / Unlimited `}
			</div>
			<img
				class="image"
				alt={nftData.templateData?.name}
				src={'https://greenrabbit.mypinata.cloud/ipfs/' + saleImg}
			/>
			<!-- <div class="rarity" style="border-color:{rarities[rarityColor]}">common</div> -->
		</div>
		<div class="bottom">
			<p class="pack-name">{nftData.templateData?.name}</p>
			<span class="shell-cost">{getFormattedCost(nftData, 1)} {currency}</span>

			<BuyButton
				isTimer={true}
				startTime={nftData.starttime}
				disabled={getBuyDisabled(nftData)}
				text={getBuyButtonText(nftData)}
				onClick={() => {
					goto('store/' + nftData.sale_id);
				}}
			/>

			<span class="buy-error" />
		</div>
	</div>
{/if}

<style>
	.wrapper {
		width: 168px;
		/* max-width: xyz px; USE THIS scaling to tablet */
		height: 316px;
		position: relative;
		overflow: hidden;
		margin: 0 3px 10px 3px;
	}

	/* .wrapper:before {
		content: '';
		position: absolute;
		margin: -25px;
		width: 50px;
		height: 50px;
		transform: rotate(45deg);
		background-color: var(--rarity-color);
		z-index: 3;
	} */
	.pack-name {
		font-size: 16px;
		min-height: 49px;
		overflow: hidden;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		display: -webkit-box;
	}
	.bottom span.shell-cost {
		font-size: 14px;
		color: var(--primary-teal);
		margin-bottom: 10px;
		line-height: 12px;
	}
	.top {
		height: calc(316px - 160px);
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #343434;
		position: relative;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;

		font-size: 11px;
		color: var(--pure-white);
		height: 160px;
		background-color: var(--dark-grey);
		bottom: 0;
		padding: 0 8px 0px;
		text-align: left;
	}

	.bottom p {
		margin-top: 10px;
	}
	.bottom span {
		width: 100%;
		text-align: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		text-align: left;
	}

	.bottom span:first-of-type {
		margin-top: 12px;
	}
	.bottom span:not(:first-of-type) {
		color: var(--primary-teal);
	}
	.bottom span.buy-error {
		color: var(--danger);
		margin: 6px 0;
	}
	.mint {
		position: absolute;
		top: 6px;
		right: 10px;
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 9px;
		color: var(--pure-white);
		border: 2px solid var(--pure-white);
		border-radius: 25px;
		padding: 4px 8px;
		text-align: center;
	}

	.rarity {
		font-size: 9px;
		font-weight: bold;
		position: absolute;
		bottom: -15px;
		right: 0;
		left: 0;
		margin: 0 auto;
		width: min-content;
		padding: 4px 8px;
		border: 2px solid red;
		border-radius: 25px;
		z-index: 2;
		color: var(--pure-white);
		background-color: var(--dark-grey);
	}

	.image {
		object-fit: contain;
		width: 145px;
		height: 120px;
	}

	@media (min-width: 481px) {
	}

	@media (min-width: 768px) {
		.wrapper {
			width: 264px;
			height: 439px;
		}
		.bottom {
			height: 172px;
			padding: 0 18px;
		}
		.top {
			height: calc(439px - 172px);
		}
		.image {
			width: 195px;
			height: 233px;
		}

		.bottom span.buy-error {
			color: var(--danger);
			margin: 6px 0 16px;
			font-size: 13px;
		}
	}
</style>
