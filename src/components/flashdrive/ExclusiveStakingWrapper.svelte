<script>
	import { promoAssetsStore } from 'src/stores/store';

	import { slide } from 'svelte/transition';
	import ExclusiveStakeButton from '../promostaking/ExclusiveStakeButton.svelte';

	let available = 0;
	let staked = 0;
	let power = 0;

	$: {
		if ($promoAssetsStore) {
			let tempPower = 0;

			let stakedTemp = 0;
			let availableTemp = 0;
			$promoAssetsStore.forEach((e) => {
				e.data.forEach((element) => {
					if (element.schema.schema_name === 'exclusives') {
						if (element.isStaked && element.isStakeable) {
							stakedTemp++;
							tempPower += element.weight;
						} else if (element.isStakeable) availableTemp++;
					}
				});
			});

			available = availableTemp;
			staked = stakedTemp;
			power = tempPower;
		}
	}
</script>

<div class="wrapper" in:slide={{ delay: 400 }}>
	<h1>Exclusive NFTs</h1>
	<div class="shell-info">
		<div>
			<span class="">Available for staking</span>
			<span class="teal">{available}</span>
		</div>
		<div class="num-staked">
			<span>Staked</span>
			<span class="teal">{staked}/3</span>
		</div>
	</div>

	<div class="claim-info">
		<ExclusiveStakeButton />
		<div />
	</div>
</div>

<style>
	.wrapper {
		color: white;
		border-top: solid 1px #707070;
		margin: 0 auto;
		padding-top: 36px;
		min-height: 150px;
	}

	.wrapper h1 {
		font-size: 20px;
		margin-bottom: 36px;
		text-align: center;
		font-weight: 900;
	}

	.claim-info {
		display: flex;
		margin: 0 auto 42px;
		padding: 0 14px;
		align-items: center;
		max-width: 375px;
	}
	.shell-info {
		display: flex;
		margin: 0 auto 42px;
		padding: 0 14px;
		align-items: center;
		text-align: right;
		max-width: 375px;
		justify-content: space-between;
	}
	.shell-info div {
		display: flex;
		flex-direction: column;
		text-align: right;
	}

	.claim-info div {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
	}
	.num-staked {
		align-self: end;
	}
	.teal {
		color: var(--primary-teal);
	}

	@media (min-width: 1024px) {
		.claim-info {
			max-width: none;
			margin: 0;
			padding: 0;
		}

		.shell-info {
			max-width: none;
			margin: 0 48px 0 0;
			padding: 0;
			flex: 0 0 250px;
		}

		.wrapper {
			display: flex;
			max-width: 1256px;
			padding: 0 0;
		}
		.num-staked {
			align-self: initial;
		}
		.wrapper h1 {
			white-space: nowrap;
			flex: 2;
			margin-top: 48px;
			text-align: left;
		}
	}
</style>
