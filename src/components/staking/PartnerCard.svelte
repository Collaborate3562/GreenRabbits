<script>
	import { assetsStore } from 'src/stores/store';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';

	export let partner;
	let available = 0,
		staked = 0,
		total_shell = 0,
		power = 0,
		cooldown = 0;

	$: {
		if ($assetsStore.length) {
			let tempPower = 0;

			let stakedTemp = 0;
			let availableTemp = 0;
			let cooldownTemp = 0;
			$assetsStore.forEach((element) => {
				if (element.collection.collection_name == partner.collectionName) {
					if (element.isStaked && element.isStakeable) {
						stakedTemp++;
						tempPower += element.weight;
					} else if (element.isStakeable && !element.isStaked) {
						availableTemp++;
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

<div class="card-data">
	<h3>{partner.name}</h3>
	<div class="card-label">
		<span>Available to stake</span>
		<span class="teal">{available}</span>
	</div>
	<div class="card-label">
		<span>Staked NFTs</span>
		<span class="teal">{staked}</span>
	</div>
	<div class="card-label mt-16">
		<span>Shell/h</span>
		<span class="teal">{toFixedCurrency(power / 10000, 2)}</span>
	</div>
</div>

<style>
	.card-data {
		width: 100%;
		padding: 15px 10px;
	}
	.card-label {
		display: flex;
		font-size: 16px;
		font-weight: 600;
	}
	.card-label .teal {
		color: var(--primary-teal);
		margin-left: 15px;
	}
	.mt-16 {
		margin-top: 16px;
	}
</style>
