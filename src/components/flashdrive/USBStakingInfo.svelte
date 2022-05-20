<script>
	import { assetsStore, promoAssetsStore, promoBalancesStore } from 'src/stores/store';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { slide } from 'svelte/transition';
	import { getCooldownData } from 'src/utils/helpers';

	import ResetIcon from '../misc/ResetIcon.svelte';

	let available = 0;
	let staked = 0;
	let cooldown = 0;
	let power = 0;

	$: {
		if ($assetsStore.length) {
			let tempPower = 0;

			let stakedTemp = 0;
			let availableTemp = 0;
			let cooldownTemp = 0;
			$assetsStore.forEach((element) => {
				if (
					element.collection.collection_name == 'greenrabbit' ||
					element.collection.collection_name == 'greenrabbitx'
				) {
					if (element.isStaked && element.isStakeable) {
						stakedTemp++;
						tempPower += element.weight;
					} else if (element.isStakeable && !element.isStaked) {
						let nftOnCooldown = new Date().getTime() / 1000 < getCooldownData(element);
						if (nftOnCooldown) cooldownTemp++;
						else availableTemp++;
					}
				}
			});

			available = availableTemp;
			staked = stakedTemp;
			power = tempPower;
			cooldown = cooldownTemp;
		}
	}
</script>

<div class="wrapper" in:slide={{ delay: 400 }}>
	<h1>Flash Drives</h1>
	<div class="shell-info">
		<div class="num-staked">
			<span class="">Available for staking</span>
			<span class="teal">{available}</span>
		</div>
		<div class="num-staked">
			<span>Staked</span>
			<span class="teal">{staked}</span>
		</div>
		<div class="num-staked">
			<span>On Cooldown</span>
			<span class="teal">{cooldown}</span>
		</div>
		<div style="margin-right:25px;">
			<ResetIcon {cooldown} />
		</div>
	</div>

	<div class="claim-info">
		<div>
			<span>Shell/h</span>
			<span class="teal">{toFixedCurrency(power / 10000, 2)}</span>
		</div>
	</div>
</div>

<style>
	.wrapper {
		color: white;
		border-top: solid 1px #707070;
		margin: 36px auto;
		padding: 36px 0;
		display: flex;
		max-width: 1256px;
		width: 96%;
		align-items: center;
	}

	.wrapper h1 {
		font-size: 20px;
		font-weight: 900;
		text-align: left;
		width: 50%;
	}

	.shell-info {
		display: flex;
		align-items: center;
		width: 50%;
		justify-content: space-between;
		font-size: 18px;
	}

	.shell-info div {
		display: flex;
		flex-direction: column;
		text-align: right;
	}

	.teal {
		color: var(--primary-teal);
		font-size: 20px;
	}

	@media (max-width: 1024px) {
		.wrapper h1 {
			width: 40%;
		}
		.shell-info {
			width: 60%;
		}
	}

	@media (max-width: 768px) {
		.wrapper {
			width: 100%;
			flex-direction: column;
			padding: 36px 10px;
			border-top: solid 2px #707070;
		}
		.wrapper h1 {
			width: 100%;
			margin-bottom: 30px;
		}
		.shell-info {
			width: 100%;
			flex-direction: column;
			font-size: 16px;
		}
		.shell-info .num-staked {
			width: 100%;
			flex-direction: row;
			justify-content: space-between;
			border-bottom: 1px solid #171717;
			padding-top: 5px;
		}
		.shell-info .num-staked:last-child {
			border-bottom: none;
		}
		.teal {
			font-size: 18px;
		}
	}
</style>
