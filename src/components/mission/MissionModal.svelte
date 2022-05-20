<script>
	import { tokens } from 'src/utils/constants';

	import {
		getMissionImg,
		getMissionRates,
		getInjuryChance,
		getLuckChance,
		getMissionTier
	} from 'src/utils/helpers';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';

	import CtaButton from '../CTAButton.svelte';
	import StartTimerLite from '../StartTimerLite.svelte';
	export let mission;
	export let startMission;
	export let character;
	$: name = mission.name;
	$: weather = mission.current_weather.key;
	$: missionImg = getMissionImg(mission.name);
	$: fee = mission.current_weather.fee;
	$: tier = getMissionTier(mission);
	$: material = mission.materials[0].token.split(' ')[1].toLowerCase();
	$: reward = mission.materials[0].base_amount / 10000;
	$: rates = getMissionRates(mission);
	$: successRate = rates.success_rate;
	$: injuryRate = getInjuryChance(mission, character);
	$: duration = mission.current_weather.base_mission_duration / 3600;
	$: luck = getLuckChance(mission, character);

	let weathers = {
		good: 'Sunny',
		neutral: 'Normal',
		bad: 'Thunder storm'
	};
	let resource = 'sap';
	let amount = 30;

	export let closeModal;
</script>

<div class="frame">
	<div class="content">
		<div class="image">
			<img src="/assets/mission/{missionImg}_{weather}.png" alt="" />
			<div class="img-overlay" />
		</div>
		<div class="weather">
			<img src="/assets/mission/weather/{weather}.svg" alt="" />
			<span>{weathers[weather]}</span>
			<span><StartTimerLite start={mission.next_weather_change} /></span>
		</div>
		<div class="tier">
			<div class="tierWrap">
				<img src="/assets/mission/tier{tier}.svg" alt="" />
			</div>
		</div>
		<div class="centerwrap">
			<div class="resource">
				<img src="/assets/mission/{material}.png" alt="" />
				<span>{reward}/hr</span>
				<span>{tokens[material.toUpperCase()]}</span>
				<span class="name">{name}</span>
			</div>
		</div>
		<div class="centerwrap">
			<div class="outcome-wrap">
				<div class="outcomes">
					<div class="outcome">
						<div class="outcome-top">
							<div class="outcome-icon"><img src="/assets/mission/success.svg" alt="" /></div>
							<div class="outcome-text">{successRate}%</div>
						</div>
						<div class="outcome-label">SUCCESS RATE</div>
					</div>
					<div class="outcome">
						<div class="outcome-top">
							<div class="outcome-icon"><img src="/assets/mission/injury.svg" alt="" /></div>
							<div class="outcome-text">{injuryRate}%</div>
						</div>
						<div class="outcome-label">INJURY RATE</div>
					</div>
					<div class="outcome">
						<div class="outcome-top">
							<div class="outcome-icon"><img src="/assets/mission/luck.svg" alt="" /></div>
							<div class="outcome-text">{luck}%</div>
						</div>
						<div class="outcome-label">LUCK</div>
					</div>
					<div class="outcome">
						<div class="outcome-top">
							<div class="outcome-icon"><img src="/assets/mission/time.svg" alt="" /></div>
							<div class="outcome-text">{duration}h</div>
						</div>
						<div class="outcome-label">EST. MISSION TIME</div>
					</div>
				</div>
			</div>
		</div>

		<div class="fee-wrap">
			<div class="fee">
				<img
					src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629214217/GreenRabbit/shell-icon.png"
					alt=""
				/>
				<span> {toFixedCurrency(Number(fee.split('.')[0]), 0)}.{fee.split('.')[1]}</span>
			</div>
		</div>
		<div class="bottom-wrap">
			<img src="/assets/mission/bottom-modal.png" alt="" />
		</div>
		<div class="centerwrap">
			<div class="button-wrap">
				<div class="button">
					<CtaButton
						onClick={() => {
							startMission(mission);
							closeModal();
						}}
						text="GO TO MISSION"
						fontSize="16px"
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.frame {
		clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 35px, 35px 0);
		clip: polygon(100% 0, 100% 100%, 0 100%, 0 35px, 35px 0);
		background: linear-gradient(167deg, #373737 7.34%, #111111 87.67%);
		width: 100%;
		min-height: 486px;
		overflow: hidden;
	}
	.content {
		padding: 2%;
		color: white;
	}
	.image img {
		width: 100%;
		max-height: 268px;
		min-height: 268px;
		object-fit: cover;
		clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 35px, 35px 0);
	}
	.img-overlay {
		min-height: 268px;
		position: absolute;
		clip: polygon(100% 0, 100% 100%, 0 100%, 0 35px, 35px 0);
		clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 35px, 35px 0);
		background: linear-gradient(360deg, #000000 -2.12%, rgba(0, 0, 0, 0) 77.99%);
		opacity: 0.6;
		top: 0px;
		width: 96%;
		margin-top: 2%;
	}
	.weather {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 50px;
		margin-left: 20px;
		margin-top: 20px;
		top: 15px;
	}
	.weather span {
		padding-top: 11px;
		font-style: normal;
		font-weight: 900;
		font-size: 13px;
		line-height: 16px;
		text-align: center;
		letter-spacing: 0.05em;
		text-transform: uppercase;

		color: #ffffff;
	}
	.tierWrap {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.centerwrap {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	.tier {
		position: relative;
	}
	.tier img {
		position: absolute;

		margin-top: -12px;
		bottom: 214px;
	}
	.resource {
		position: absolute;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin-top: 70px;
		top: 0;
	}

	.resource img {
		position: relative;
		width: 85px;
		top: 90%;
	}
	.resource span {
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 20px;
		line-height: 24px;
		display: flex;
		align-items: center;
		text-align: center;
		letter-spacing: 0.05em;

		justify-content: center;

		color: #ffffff;

		text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.4);
	}
	.outcome {
		width: 116px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.outcomes {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		/* top: 252px; */
	}
	.outcome-wrap {
		width: 80%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		margin-top: -26px;
	}
	.outcome-text {
		margin-left: 10px;
	}
	.outcome-label {
		font-size: 12px;
		text-align: center;
	}
	.outcome-top {
		width: 94px;
		height: 47px;

		background: #0d0d0d;
		border-radius: 4px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.bottom-wrap img {
		position: relative;

		min-width: 108%;
		margin-right: -4%;
		margin-left: -4%;
	}

	.fee-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 58px;
	}
	.fee {
		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
	}
	.fee img {
		width: 24px;
	}
	.fee span {
		margin-left: 10px;
		font-family: Lato;
		font-style: normal;
		font-weight: 500;
		font-size: 17px;
		line-height: 20px;
		letter-spacing: 0.05em;
	}

	.button-wrap {
		position: absolute;
		margin-top: -78px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.button-wrap .button {
		position: relative;
	}

	@media (max-width: 768px) {
		.outcome-top {
			width: 74px;
			height: 74px;
			flex-direction: column;
		}
		.outcome-text {
			margin: 0;
			font-family: Lato;
			font-style: normal;
			font-weight: normal;
			font-size: 15px;
			line-height: 18px;
		}
		.outcome {
			width: 86px;
		}
		.outcome-wrap {
			margin-top: -46px;
		}
		.outcome-label {
			font-family: Lato;
			font-style: normal;
			font-weight: bold;
			font-size: 13px;
			line-height: 16px;
			text-align: center;
			letter-spacing: 0.05em;
			text-transform: uppercase;
			min-height: 49px;
			margin-top: 4px;
		}
		.fee-wrap {
			margin-top: 75px;
		}
		.fee {
			font-family: Lato;
			font-style: normal;
			font-weight: 500;
			font-size: 17px;
			line-height: 20px;
			letter-spacing: 0.05em;
		}
		.bottom-wrap {
			transform: scale(1.4);
		}
		.button-wrap {
			margin-top: -47px;
		}
	}
</style>
