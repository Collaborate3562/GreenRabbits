<script>
	import { goto } from '$app/navigation';
	import { assetsStore } from 'src/stores/store';
	import { partners } from 'src/utils/partners';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import { slide } from 'svelte/transition';
	import CtaButton from '../CTAButton.svelte';
	import BackButton from './BackButton.svelte';
	import PartnerCard from './PartnerCard.svelte';

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
			partners.forEach((e) => {
				$assetsStore.forEach((element) => {
					if (element.collection.collection_name == e.collectionName) {
						if (element.isStaked && element.isStakeable) {
							stakedTemp++;
							tempPower += element.weight;
						} else if (element.isStakeable && !element.isStaked) {
							availableTemp++;
						}
					}
				});
			});

			available = availableTemp;
			staked = stakedTemp;
			power = tempPower;
			cooldown = cooldownTemp;
		}
	}
</script>

<div class="wrapper">
	<div class="header" in:slide={{ delay: 400 }}>
		<div style="margin-right: 58px;">
			<BackButton clearSelects={false} text="STAKING" link="/hub" />
		</div>

		<h1>Partner Staking NFTs</h1>
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
				<span>Total Shell/h</span>
				<span class="teal">{toFixedCurrency(power / 10000, 2)}</span>
			</div>
			<!-- 	<div class="num-staked">
				<span>Available to claim</span>
				<span class="teal">{available_claim}</span>
			</div> -->
		</div>
	</div>
	<div class="partners" in:slide={{ delay: 400 }}>
		{#each partners as partner}
			<div
				on:click={() => {
					goto(`/partner/${partner.slug}`);
				}}
				class="partner-card"
			>
				<img src={partner.image} alt="" />
				<PartnerCard {partner} />
			</div>
		{/each}
	</div>
</div>

<style>
	.wrapper {
		margin: 0 auto;
		color: white;
		max-width: 1256px;
		width: 96%;
	}
	.header {
		width: 100%;
		display: flex;
		align-items: center;
	}
	.header h1 {
		font-size: 20px;
		font-weight: 900;
		white-space: nowrap;
		width: 50%;
		margin-top: -20px;
	}
	.shell-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 50%;
		font-size: 18px;
	}
	.num-staked {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		position: relative;
	}
	.num-staked .teal {
		color: var(--primary-teal);
		font-size: 20px;
		font-weight: 600;
	}
	.partners {
		width: 100%;
		margin-top: 80px;
		display: grid;
		justify-content: space-between;
		gap: 50px 16px;
		grid-template-columns: repeat(auto-fit, minmax(295px, max-content));
		margin-bottom: 100px;
	}
	.partner-card {
		width: 294px;
		height: 278px;
		border-radius: 4px;
		background-image: linear-gradient(to bottom, #4b4b4b, #292828);
		cursor: pointer;
	}
	.partner-card:hover {
		box-shadow: 0 0 0 2px var(--primary-teal);
	}
	.partner-card img {
		width: 100%;
		height: 127px;
	}

	@media (max-width: 1024px) {
		.partners {
			justify-content: space-around;
		}
		.header {
			margin-top: 40px;
		}
		.header h1 {
			width: 30%;
		}
		.shell-info {
			width: 70%;
		}
	}

	@media (max-width: 768px) {
		.wrapper {
			width: 100%;
			padding: 10px;
		}
		.header {
			flex-direction: column;
		}
		.header h1 {
			font-size: 18px;
			width: 100%;
			margin-bottom: 20px;
			text-align: center;
		}
		.shell-info {
			flex-direction: column;
			width: 100%;
			font-size: 16px;
		}
		.num-staked {
			flex-direction: row;
			width: 100%;
			justify-content: space-between;
			border-bottom: 1px solid #171717;
			padding-top: 5px;
		}
		.num-staked:last-child {
			border-bottom: none;
		}
		.num-staked .teal {
			font-size: 18px;
		}
	}
</style>
