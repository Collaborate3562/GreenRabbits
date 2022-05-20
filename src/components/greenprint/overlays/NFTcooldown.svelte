<script>
	import CooldownTimer from 'src/components/CooldownTimer.svelte';
	import CtaButton from 'src/components/CTAButton.svelte';
	import ResetCrafting from './ResetCrafting.svelte';

	export let nftData;
	export let cooldownEnds;
	let innerWidth;
	import { getContext } from 'svelte';
	let stylingResetCD = {
		styleWindow: {
			height: '450px',
			width: '400px'
		},
		styleContent: {
			height: '100%',
			width: '100%'
		}
	};
	const { open, close } = getContext('simple-modal');
	function onClose() {
		close();
	}
</script>

<svelte:window bind:innerWidth />
<div class="nft-staked">
	<div class="content">
		<img alt="staked circle" src="/assets/cooldown-circle.png" />

		<div class="box">
			<p class="cooldown">ON COOLDOWN</p>
			<div class="countdown">
				<p>
					<CooldownTimer {cooldownEnds} />
				</p>
			</div>
			<CtaButton
				onClick={() =>
					open(
						ResetCrafting,
						{
							onClose,
							weight: nftData.weight,
							nftData,
							end:
								Number(nftData.mutable_data['Last Used']) +
								3600 * (12 * Number(nftData.mutable_data['Status Type']))
						},
						stylingResetCD
					)}
				text="RESET COOLDOWN"
				width={innerWidth < 768 ? '95px' : '160px'}
				height="40px"
				fontSize={innerWidth < 768 ? '8px' : '14px'}
				outlined
				margin="12px 0 0 0"
			/>
		</div>
	</div>
</div>

<style>
	.cooldown {
		font-size: 14px;
		font-weight: bold;
	}

	.countdown {
		line-height: 20px;
		color: var(--danger-highlight);
	}
	.countdown p {
		font-size: 15px;
	}
	.box p {
		font-size: 13px;
		color: white;
		font-weight: 900;
	}
	.box p.cta {
		color: var(--primary-teal);
	}
	.box {
		display: flex;
		align-items: center;
		padding-top: 10px;
		flex-direction: column;
		width: 100%;
		height: 110px;
		border-radius: 2px;
		position: absolute;
		top: 20px;
		border: solid 1px #484848;

		background-color: rgba(0, 0, 0, 0.64);
	}
	.content img {
		display: none;
	}
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		position: relative;
	}
	.nft-staked {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;
	}
	@media (min-width: 1024px) {
		.cooldown {
			font-size: 14px;
			font-weight: bold;
		}

		.countdown {
			line-height: 20px;
			color: var(--danger-highlight);
		}
		.countdown p {
			font-size: 15px;
		}
		.box p {
			font-size: 15px;
			color: white;
			font-weight: 900;
		}
		.box p.cta {
			color: var(--primary-teal);
		}
		.box {
			display: flex;
			align-items: center;
			padding-top: 34px;
			flex-direction: column;
			width: 180px;
			height: 140px;
			border-radius: 2px;

			border: solid 1px #484848;

			background-color: rgba(0, 0, 0, 0.64);
		}
		.content img {
			position: absolute;
			width: 45px;
			height: 45px;
			top: 20px;
		}
		.content {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			position: relative;
		}
		.nft-staked {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
		}
	}
</style>
