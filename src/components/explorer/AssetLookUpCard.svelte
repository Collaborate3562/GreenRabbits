<script>
	import {
		AGILITY_MAX,
		INTELLECT_MAX,
		LUCK_MAX,
		RESILIENCE_MAX,
		SPEED_MAX,
		STRENGTH_MAX
	} from 'src/utils/constants';

	import { convertHexToRGBA, getCooldownData } from 'src/utils/helpers';
	import CooldownTimer from '../CooldownTimer.svelte';
	export let nftData;

	export let craftedWith;
	let onSale = false;

	let data;

	//nftData?.memo == "sale" ? onSale = true : ""
	/*     nftData?.is_recipient_contract ? data = nftData.sender_assets[0] : nftData?.is_sender_contract ? data = nftData.recipient_assets[0] : ""*/
	if (nftData?.asset_id) {
		data = nftData;
	} else {
		data = nftData?.assets[0];
		onSale = true;
	}

	let source = data.data.img || data.data.video;
	let bonus = data?.bonusStats?.total || 0;

	let imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;
	let showImage = true;

	$: source = data.data.img || data.data.video;
	$: imageSource = `https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/${source}.png`;

	let nftOnCooldown = false;
	let cooldownEnds = getCooldownData(data);
	nftOnCooldown = new Date().getTime() / 1000 < cooldownEnds;
	console.log(data);
</script>

<div class="wrapper">
	<div class="top">
		<div class="left">
			<div class="image">
				<img src={imageSource} class="image" alt="" />
			</div>
			<div class="mint">#{data.template_mint}</div>
			<div class="bosted_bonus">
				{#if bonus}
					<div class="bonusWrapper">
						<div class="bonus">
							<img src="/assets/bonus.svg" alt="bonus" />
							{bonus.toFixed(2)}%
						</div>
					</div>
				{/if}
				{#if data.data['Boosted Count']}
					<div class="boostedWrapper">
						<div class="boosted">
							<img src="/assets/bonus.svg" alt="boosted" />
							{data.data['Boosted Count'] || 0}
						</div>
					</div>
				{/if}
			</div>
		</div>
		<div class="right">
			<div class="cardTitle">
				{data.data.name}
			</div>
			<div class="basicInfos">
				<div class="info">
					<div class="assetID singleInfo">
						<div class="infoType">Asset ID</div>
						<div class="infoData">
							#{data.asset_id}
						</div>
					</div>
					<div class="rarity singleInfo">
						{#if data.data.Rarity}
							<div class="infoType">Rarity</div>
							<div class="infoData">
								{data.data.Rarity}
							</div>
						{/if}
					</div>
				</div>
				<div class="info">
					{#if data.data['Crafted With']}
						<div class="craftedWith singleInfo">
							<div class="infoType">Collection</div>
							<div class="infoData">
								{data.data['Crafted With']}
							</div>
						</div>
					{/if}
					{#if data.data.Class}
						<div class="class singleInfo">
							<div class="infoType">Class</div>
							<div class="infoData">
								{data.data.Class}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="onSaleStats">
				{#if nftData.weight > 0}
					<div class="shell">Shell/h: {(nftData.weight / 10000).toFixed(2)}</div>{/if}
				{#if nftOnCooldown}
					<div class="coldDownInfo">Cooldown: <CooldownTimer {cooldownEnds} /></div>
				{/if}
			</div>

			<div class="stats">
				<div class="left">
					{#if data?.bonusStats?.strength}
						<div>
							<p class="ability-title">STRENGTH</p>
							<div class="strength-bar">
								<div class="storage-bar-drive">
									{#if data?.bonusStats?.strength.boost > 0}
										<div
											class="progress-boost"
											style="--storage-filled-boost:   {(
												(Number(data?.bonusStats?.strength.real) / STRENGTH_MAX) *
												100
											).toFixed(0)}%"
										/>
									{/if}
									<div
										class="progress-done"
										style="{data?.bonusStats?.strength.boost > 0
											? 'margin-top: -8px;'
											: ''}--storage-filled: 
                                {(
											(Number(data?.bonusStats?.strength.base) / STRENGTH_MAX) *
											100
										).toFixed(0)}%"
									/>
								</div>
								<div class:whiteText={data?.bonusStats?.strength.boost == 0} class="bar-label">
									{data?.bonusStats?.strength.real}
								</div>
							</div>
						</div>
					{/if}
					{#if data?.bonusStats?.resilience}
						<div>
							<p class="ability-title">RESILIENCE</p>
							<div class="strength-bar">
								<div class="storage-bar-drive">
									{#if data?.bonusStats?.resilience.boost > 0}
										<div
											class="progress-boost"
											style="--storage-filled-boost:   {(
												(Number(data?.bonusStats?.resilience.real) / RESILIENCE_MAX) *
												100
											).toFixed(0)}%"
										/>
									{/if}
									<div
										class="progress-done"
										style="{data?.bonusStats?.resilience.boost > 0
											? 'margin-top: -8px;'
											: ''}--storage-filled: 
                                {(
											(Number(data?.bonusStats?.resilience.base) / RESILIENCE_MAX) *
											100
										).toFixed(0)}%"
									/>
								</div>
								<div class:whiteText={data?.bonusStats?.resilience.boost == 0} class="bar-label">
									{data?.bonusStats?.resilience.real}
								</div>
							</div>
						</div>
					{/if}
					{#if data?.bonusStats?.intellect}
						<div>
							<p class="ability-title">INTELLECT</p>
							<div class="strength-bar">
								<div class="storage-bar-drive">
									{#if data?.bonusStats?.intellect.boost > 0}
										<div
											class="progress-boost"
											style="--storage-filled-boost:   {(
												(Number(data?.bonusStats?.intellect.real) / INTELLECT_MAX) *
												100
											).toFixed(0)}%"
										/>
									{/if}
									<div
										class="progress-done"
										style="{data?.bonusStats?.intellect.boost > 0
											? 'margin-top: -8px;'
											: ''}--storage-filled: 
                                {(
											(Number(data?.bonusStats?.intellect.base) / INTELLECT_MAX) *
											100
										).toFixed(0)}%"
									/>
								</div>
								<div class:whiteText={data?.bonusStats?.intellect.boost == 0} class="bar-label">
									{data?.bonusStats?.intellect.real}
								</div>
							</div>
						</div>
					{/if}
				</div>
				<div class="right">
					{#if data?.bonusStats?.agility}
						<div>
							<p class="ability-title">AGILITY</p>
							<div class="strength-bar">
								<div class="storage-bar-drive">
									{#if data?.bonusStats?.agility.boost > 0}
										<div
											class="progress-boost"
											style="--storage-filled-boost:   {(
												(Number(data?.bonusStats?.agility.real) / AGILITY_MAX) *
												100
											).toFixed(0)}%"
										/>
									{/if}
									<div
										class="progress-done"
										style="{data?.bonusStats?.agility.boost > 0
											? 'margin-top: -8px;'
											: ''}--storage-filled: 
                                {(
											(Number(data?.bonusStats?.agility.base) / AGILITY_MAX) *
											100
										).toFixed(0)}%"
									/>
								</div>
								<div class:whiteText={data?.bonusStats?.agility.boost == 0} class="bar-label">
									{data?.bonusStats?.agility.real}
								</div>
							</div>
						</div>
					{/if}
					{#if data?.bonusStats?.speed}
						<div>
							<p class="ability-title">SPEED</p>
							<div class="strength-bar">
								<div class="storage-bar-drive">
									{#if data?.bonusStats?.speed.boost > 0}
										<div
											class="progress-boost"
											style="--storage-filled-boost:   {(
												(Number(data?.bonusStats?.speed.real) / SPEED_MAX) *
												100
											).toFixed(0)}%"
										/>
									{/if}
									<div
										class="progress-done"
										style="{data?.bonusStats?.speed.boost > 0
											? 'margin-top: -8px;'
											: ''}--storage-filled: 
                                {((Number(data?.bonusStats?.speed.base) / SPEED_MAX) * 100).toFixed(
											0
										)}%"
									/>
								</div>
								<div class:whiteText={data?.bonusStats?.speed.boost == 0} class="bar-label">
									{data?.bonusStats?.speed.real}
								</div>
							</div>
						</div>
					{/if}
					{#if data?.bonusStats?.luck}
						<div>
							<p class="ability-title">LUCK</p>
							<div class="strength-bar">
								<div class="storage-bar-drive">
									{#if data?.bonusStats?.luck.boost > 0}
										<div
											class="progress-boost"
											style="--storage-filled-boost:   {(
												(Number(data?.bonusStats?.luck.real) / LUCK_MAX) *
												100
											).toFixed(0)}%"
										/>
									{/if}
									<div
										class="progress-done"
										style="{data?.bonusStats?.luck.boost > 0
											? 'margin-top: -8px;'
											: ''}--storage-filled: 
                                {((Number(data?.bonusStats?.luck.base) / LUCK_MAX) * 100).toFixed(
											0
										)}%"
									/>
								</div>
								<div class:whiteText={data?.bonusStats?.luck.boost == 0} class="bar-label">
									{data?.bonusStats?.luck.real}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="bottom">
		{#if onSale}<span style="margin-top:-10px;font-size:16px;margin-bottom:10px;color:white"
				>{(nftData.price.amount / 100000000).toFixed(2)} {nftData.price.token_symbol}</span
			>{/if}

		<a
			href={onSale
				? 'https://wax.atomichub.io/market/sale/' + nftData.sale_id
				: 'https://wax.atomichub.io/explorer/asset/' + nftData.asset_id}
			target="_blank"
		>
			View on Atomichub
		</a>
	</div>
</div>

<style>
	.mint {
		position: absolute;

		background-color: rgba(0, 0, 0, 0.5);
		font-size: 9px;
		color: var(--pure-white);
		border: 2px solid var(--primary-teal);
		border-radius: 25px;
		padding: 4px 8px;
		text-align: center;
	}
	.whiteText {
		color: white;
	}
	.bar-label {
		min-width: 30px;
		text-align: right;
		font-size: 10px;
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #1d1d1d;
		border-radius: 5px;
		width: 415px;
		min-height: 355px;
		height: max-content;
		padding: 5px;
	}
	.top {
		height: 271px;
		display: flex;
		width: 100%;
		align-items: center;
	}
	.bottom {
		display: flex;
		flex-direction: column;
		margin-top: 20px;
		color: #36ffc0;
		font-size: 12px;
		text-align: center;
	}
	.top .left {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.image {
		position: relative;
		width: 90%;
		max-width: 150px;
		min-width: 150px;
		max-height: 213px;
		object-fit: scale-down;
	}
	.image img {
		width: 100%;
		height: 100%;
	}
	.image .onSale {
		position: absolute;
		top: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		z-index: 5;
		text-align: center;
	}
	.top .bosted_bonus {
		display: flex;
		flex-direction: row;
	}
	.bosted_bonus .bonusWrapper,
	.bosted_bonus .boostedWrapper {
		margin: 0 7px;
		color: rgb(255, 255, 255);

		cursor: default;
	}
	.bonusWrapper .bonus,
	.boostedWrapper .boosted {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		padding: 5px;
		background: black;
	}
	.bonus img,
	.boosted img {
		margin-right: 5px;
	}
	.top .right {
		display: flex;
		flex-direction: column;
		margin-left: 10px;
		width: 100%;
	}
	.basicInfos {
		display: flex;
		flex-direction: row;
		margin: 12px 0;
	}
	.basicInfos .info {
		display: flex;
		margin: 6px 0;
		flex-direction: column;
	}

	.top .right .cardTitle {
		font-size: 18px;
	}
	.assetID,
	.craftedWith {
		margin-right: 25px;
	}
	.singleInfo .infoType {
		margin-top: 8px;
		font-size: 12px;
	}
	.singleInfo .infoData {
		font-size: 14px;
		font-weight: 600;
	}
	.onSaleStats .shell {
		color: #36ffc0;
	}
	.onSaleStats .coldDownInfo {
		text-align: center;
		margin-top: 10px;
		padding: 5px;
		border: 1px solid white;
		width: 80%;
	}
	.stats {
		display: flex;
		font-size: 12px;
	}
	.stats .right,
	.stats .left {
		width: 100%;
		align-items: inherit;
	}

	.storage-bar-drive {
		background-color: #2e2e2e;
		border-radius: 20px;
		position: relative;
		height: 8px;
		width: 80px;
		margin-right: 5px;
	}
	.strength-bar {
		display: flex;
		color: #36ffc0;
		align-items: center;
	}
	.strength-boost-bar {
		display: flex;
		color: rgb(255, 255, 255);
		align-items: center;
		position: absolute;
	}

	.progress-done {
		background: var(--primary-teal);
		box-shadow: 0 0 6px 0 #36ffc0;
		border-radius: 20px;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: var(--storage-filled);
		opacity: 1;
		transition: 1s ease 0.3s;
		margin: 0;
	}
	.progress-boost {
		background: #ffec00;

		border-radius: 20px;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: var(--storage-filled-boost);
		opacity: 1;
		transition: 1s ease 0.3s;
		margin: 0;
	}

	@media only screen and (max-width: 500px) {
		.wrapper {
			width: 95vw;
			justify-items: center;
		}
		.top .right {
			margin-left: 5px;
		}
		.top > .left {
			margin-right: 5px;
			width: 70%;
		}
		.image {
			width: 100%;
		}
		.top {
			height: 301px;
		}
		.top .right .cardTitle {
			font-size: 14px;
		}
		.singleInfo .infoType,
		.singleInfo .infoData {
			font-size: 11px;
		}
		.stats {
			font-size: 10px;
		}
		.bar-label {
			min-width: 0px;
			font-size: 8px;
		}
		.stats > .left {
			width: 100%;
		}
	}

	@media only screen and (max-width: 400px) {
		.wrapper {
			min-height: 260px;
		}
		.top {
			height: 230px;
		}
		.singleInfo .infoType,
		.singleInfo .infoData {
			font-size: 10px;
			white-space: nowrap;
		}
		.image {
			max-width: 110px;
			min-width: 80px;
		}
		.storage-bar-drive {
			width: 100%;
		}
		.craftedWith {
			margin: 0;
		}
		.assetID {
			margin-right: 5px;
		}
	}
</style>
