<script>
	import CtaButton from 'src/components/CTAButton.svelte';
	import { waitingConfirmationCrafting } from 'src/stores/store';

	export let craftLog;
	export let onClick;

	let rewards = [];
	let rewardsDone = false;

	const rarities = {
		uncommon: '#F2B47D',
		common: '#878787',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};

	function oneRarityHigher(rarity) {
		switch (rarity) {
			case 'Common':
				return 'Uncommon';
			case 'Uncommon':
				return 'Epic';
			case 'Epic':
				return 'Legendary';
			case 'Legendary':
				return 'Mythic';
			case 'Mythic':
				return 'Mythic';
		}
	}

	function giveRewards(rarity) {
		rewardsDone = false;
		rewards = [];
		switch (rarity) {
			case 'success':
				rewards.push({
					rarity: oneRarityHigher(craftLog.rarity),
					img: `/game_assets/orbs/${oneRarityHigher(craftLog.rarity)}.gif`
				});
				rewardsDone = true;

				break;

			case 'rare':
				rewards.push({
					rarity: oneRarityHigher(craftLog.rarity),
					img: `/game_assets/orbs/${oneRarityHigher(craftLog.rarity)}.gif`
				});
				rewards.push({ rarity: 'Common', img: `/game_assets/orbs/Common.gif` });
				rewardsDone = true;
				break;
			default:
				break;
		}
	}

	$: {
		if (craftLog.outcome != 'fail') {
			giveRewards(craftLog.outcome);
		}
	}
</script>

<div class="wrapper">
	<div class="top">
		<div class="title">
			{#if rewardsDone}
				<h1>Orbs fused successfully!</h1>
				<h2>You've received {rewards.length > 1 ? '2 orbs' : 'an Ascendant Orb'}!</h2>
			{:else if craftLog.outcome == 'fail'}
				<h1>Some Orbs were corrupted - Fusion Failed!</h1>
			{:else}
				<h1>Fusion failed!</h1>
			{/if}
		</div>
		{#if rewardsDone}
			<div class="flex-row">
				{#each rewards as reward}
					<div class="single-reward">
						<img src={reward.img} alt="{reward.rarity} Orb" />
						<div class="rarity-wrapper">
							<div class="rarity" style="--rarity-color:{rarities[reward.rarity.toLowerCase()]}; ">
								{reward.rarity}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<img
				src="/game_assets/orb_fusion_{craftLog.outcome == 'fail' ? 'fail' : 'damage'}.png"
				alt={craftLog.outcome}
			/>
			<div class="rarity-wrapper" />
		{/if}
	</div>
	<div class="bottom">
		<div class="cd">
			<div class="fusion-modal-bottom">
				<img class="cooldown-icon" alt="NFT" src="/assets/greenprint/cooldown.png" />
				{#if craftLog.outcome == 'fail'}
					<span>2 Orbs have been lost</span>
				{:else if craftLog.outcome == 'nothing'}
					<span>Orbs will be returned</span>
				{:else if craftLog.outcome == 'success' || craftLog.outcome == 'rare'}
					<span>Orbs have been consumed</span>
				{/if}
			</div>
			<div class="fusion-modal-bottom">
				<img class="cooldown-icon" alt="NFT" src="/assets/greenprint/shell-refund.png" />
				<span>Shellinium has been consumed.</span>
			</div>
		</div>
		<div class="cta-btnbox">
			<CtaButton
				{onClick}
				fontSize="16px"
				text="CLAIM"
				outlined
				width="192px"
				height="45px"
				loading={$waitingConfirmationCrafting}
				disabled={$waitingConfirmationCrafting}
			/>
		</div>
	</div>
</div>

<style>
	.single-reward {
		flex-direction: column;
		margin-left: 30px;
		margin-right: 30px;
	}
	.flex-row {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
	}
	.rarity-wrapper {
		min-height: 50px;
	}
	.rarity {
		width: 99px;
		height: 25px;
		border-radius: 12px;
		border: 1px solid var(--rarity-color);
		font-size: 12px;
		text-align: center;
		color: var(--is-disabled);
		text-transform: capitalize;
		background-color: #1d1d1d;
		z-index: 1;
		margin: 10px auto;
		padding-top: 3px;
	}
	.cd {
		margin-top: 26px;
		margin-bottom: 20px;
		padding: 0 10px;
		display: flex;
		width: 66%;
		justify-content: space-between;
		align-items: center;
	}
	.burned {
		padding: 0 44px;
		display: flex;
		align-items: center;
		margin-top: 26px;
		margin-bottom: 31px;
	}
	.cooldown-icon,
	.burned-icon {
		width: 36px;
		height: 36px;
		margin-right: 12px;
	}
	.bottom {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.wrapper {
		min-height: 576px;
	}
	.top {
		min-height: 410px;
		background-color: #111;
		padding-top: 34px;
	}
	.top img {
		max-width: 295px;
		min-height: 220px;
		max-height: 250px;
		object-fit: scale-down;
		margin: 0 auto;
		margin-bottom: 10px;
		margin-top: 20px;
	}
	h1 {
		margin: 0 0 6px;
		font-family: Lato;
		font-size: 24px;
		font-weight: 900;

		text-align: center;
		color: #fff;
	}
	h2 {
		margin: 6px 0 23px;
		font-family: Lato;
		font-size: 20px;
		font-weight: normal;

		text-align: center;
		color: #fff;
	}
	.fusion-modal-bottom {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		max-width: 240px;
	}
	.cta-btnbox {
		margin-bottom: 30px;
	}
	@media (max-width: 1024px) {
		.top img {
			max-width: 120px;
			min-height: 80px;
			object-fit: scale-down;
			margin: 0 auto;
			margin-bottom: 10px;
			margin-top: 20px;
		}
		.single-reward {
			margin-left: 5px;
			margin-right: 5px;
		}
	}

	@media (max-width: 768px) {
		.top {
			padding-top: 17px;
		}
		h1 {
			font-size: 24px;
		}
		h2 {
			margin: 6px 0 10px;
			font-size: 18px;
		}
		.cd {
			margin-top: 12px;
			margin-bottom: 4px;
			flex-direction: column;
			align-items: flex-start;
			width: fit-content;
		}
		.fusion-modal-bottom {
			margin-bottom: 2px;
			max-width: 300px;
		}
		.cta-btnbox {
			margin-bottom: 0;
		}
	}
</style>
