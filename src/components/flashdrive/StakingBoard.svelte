<script>
	import { Popover } from 'sveltestrap';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';

	export let available = 0;
	export let staked = 0;
	export let shell = 0;
	export let atc = 0;
	export let claimForward = '';
	export let title = '';
	export let btn_label = '';
</script>

<div class="wrapper" in:slide={{ delay: 400 }}>
	<h1>{title}</h1>
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
			<span>Shell/h</span>
			<span class="teal">{toFixedCurrency(shell / 10000, 2)}</span>
		</div>
		<!-- <div class="num-staked">
			<span>Available to claim</span>
			<span class="teal">{atc}</span>
			<img
				class="info-icon"
				id={`stake-${claimForward}`}
				alt="info"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
			/>
		</div> -->
	</div>

	<div class="claim-info">
		<button on:click={() => goto(`/${claimForward}`)}>{btn_label}</button>
	</div>
	<!-- <Popover trigger="hover" placement="top" target={`stake-${claimForward}`}>
		<p>
			Unclaimed staking balances are displayed next to each staking category such as; Promo's,
			Exclusives, Partner and Green Rabbit Flash-drives. <br />These unclaimed balances by category,
			make up the "Total Available to Claim" balance next to the claim button at the top of the
			screen
		</p>
	</Popover> -->
</div>

<style>
	.wrapper {
		margin: 0 auto;
		height: 151px;
		display: flex;
		color: white;
		border-top: solid 1px #707070;
		align-items: center;
		max-width: 1256px;
		width: 96%;
	}

	.wrapper h1 {
		font-size: 20px;
		font-weight: 900;
		white-space: nowrap;
		width: 25%;
		margin-top: -20px;
	}

	.shell-info {
		display: flex;
		align-items: center;
		justify-content: space-around;
		width: 60%;
		font-size: 18px;
		padding-right: 20px;
	}

	.num-staked {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		position: relative;
	}

	.claim-info {
		display: flex;
		width: 15%;
	}

	.claim-info button {
		width: 100%;
		padding: 11px;
		background: black;
		color: white;
		border: 2px solid var(--primary-teal);
		text-transform: uppercase;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.5s;
	}

	.claim-info button:hover {
		background: var(--primary-teal);
		color: black;
	}

	.teal {
		color: var(--primary-teal);
		font-size: 20px;
		font-weight: 600;
	}

	.info-icon {
		width: 20px;
		height: 20px;
		position: absolute;
		top: 3px;
		right: -25px;
	}

	@media (max-width: 768px) {
		.wrapper {
			flex-direction: column;
			width: 100%;
			height: auto;
			padding: 30px 12px;
			border-top: solid 2px #707070;
		}
		.wrapper h1 {
			margin-top: 0;
			width: 100%;
			margin-bottom: 12px;
			font-size: 18px;
		}
		.shell-info {
			width: 100%;
			flex-direction: column;
			font-size: 16px;
			padding-right: 0;
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
		.claim-info {
			width: 100%;
			margin-top: 25px;
		}
		.teal {
			font-size: 17px;
		}
		.info-icon {
			top: 7px;
			left: 130px;
		}
	}
</style>
