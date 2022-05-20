<script>
	import { assetsStore, lastSelected } from 'src/stores/store';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import StakeButton from './StakeButton.svelte';
	import UnstakeButton from './UnstakeButton.svelte';
	let generatingShell = 999999999.99;
	let storageAvailalbe = '-16';
	let bitsError = true;
	export let drive;
	let selected = 0;
	let power = 0;
	let storage = 0;
	export let partner;

	$: {
		let selectedList = $assetsStore.filter((asset) => asset.isSelected);
		selected = selectedList.length;
		let tempPower = 0;
		let tempSize = 0;
		selectedList.forEach((e) => {
			if (e.isSelected) {
				if ($lastSelected == 'staked') {
					tempPower -= e.weight;
					tempSize -= e.size;
				} else {
					tempPower += e.weight;
					tempSize += e.size;
				}
			}
		});
		power = tempPower;
		storage = tempSize;
	}
</script>

<div class="wrapper">
	<div class="selected">
		<span class="title">SELECTED</span>
		<span>{selected}</span>
		<svg width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 7">
			<defs />
			<path fill="#36ffc0" fillRule="evenodd" d="M0 .5l5 5 5-5H0z" />
		</svg>
	</div>
	<div class="generating">
		<span class="title">GENERATING SHELLINIUM /h</span>
		<span>{toFixedCurrency(power / 10000, 2)}</span>
	</div>
	<div class="storage">
		<span class="title">STORAGE AVAILABLE</span>
		<span class:bits-err={drive.capacity - drive.space_used - storage < 0}
			>{drive.capacity - drive.space_used - storage} bits</span
		>
	</div>
	<div class="cta">
		<StakeButton
			{partner}
			{drive}
			{selected}
			disabled={drive.capacity - drive.space_used - storage < 0 ||
				$lastSelected != 'staking' ||
				selected == 0}
		/>
		<UnstakeButton
			{partner}
			{drive}
			disabled={drive.capacity - drive.space_used - storage < 0 ||
				$lastSelected != 'staked' ||
				selected == 0}
		/>
	</div>
</div>

<style>
	.wrapper {
		z-index: 1000;
		background: black;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		height: 375px;
		width: 140px;
		color: white;
		border: 1px solid var(--primary-teal);
	}
	.selected {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		padding: 8px;
		font-size: 13px;
		height: 63px;
		border-bottom: 1px solid var(--primary-teal);
	}

	.selected svg {
		position: absolute;
		bottom: -9px;
	}
	.generating {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;

		padding: 8px;
		font-size: 13px;
		height: 82px;
		border-bottom: 1px solid var(--primary-teal);
	}
	.storage {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;

		padding: 8px;
		font-size: 13px;
		height: 78px;
		border-bottom: 1px solid var(--primary-teal);
	}
	.cta {
		height: 150px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
	}

	.title {
		color: var(--text-grey);
	}
	.bits-err {
		color: var(--danger);
	}

	@media (max-width: 1259px) {
		.wrapper {
			display: none;
		}
	}
</style>
