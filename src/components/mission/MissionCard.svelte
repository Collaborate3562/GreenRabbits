<script>
	import StartTimerLite from '../StartTimerLite.svelte';
	export let locked;
	export let index;
	export let active = false;
	export let mission;
	export let character;
	import CloudImg from '../../../static/assets/mission/cloud.png';
	import TierImg from '../../../static/assets/mission/tier.png';
	import PlantsFloria from '../../../static/assets/mission/Plants_Floria.png';
	import SuccessRateImg from '../../../static/assets/mission/success_rate.png';
	import UnionImg from '../../../static/assets/mission/union.png';
	import PlantImg from '../../../static/assets/mission/clover.png';
	import ClockImg from '../../../static/assets/mission/clock.png';
	export let onClick;
	import {
		getMissionImg,
		getMissionRates,
		getInjuryChance,
		getLuckChance,
		getMissionTier
	} from 'src/utils/helpers';
	import { tokens } from 'src/utils/constants';
	$: weather = mission.current_weather.key;
	$: missionImg = getMissionImg(mission.name);
	$: tier = getMissionTier(mission);
	$: material = mission.materials[0].token.split(' ')[1].toLowerCase();
	$: reward = mission.materials[0].base_amount / 10000;
	$: rates = getMissionRates(mission);
	$: successRate = rates.success_rate;
	$: injuryRate = getInjuryChance(mission, character);
	$: duration = mission.current_weather.base_mission_duration / 3600;
	$: luck = getLuckChance(mission, character);

	var dragging;
	dragging = false;

	function handleMousedown(event) {
		dragging = false;
	}

	function handleMousemove(event) {
		dragging = true;
	}

	function handleMouseup(event) {
		var wasDragging;
		wasDragging = dragging;
		dragging = false;
		if (!wasDragging) {
			setTimeout(function () {
				if (!locked) onClick();
			}, 10);
		}
	}
</script>

<div
	class:blockedCursor={locked}
	class="container"
	class:active
	on:mousedown={handleMousedown}
	on:mousemove={handleMousemove}
	on:mouseup={handleMouseup}
>
	<img src="/assets/mission/{missionImg}_{weather}.png" class="card-img" alt="" />
	<img src="/assets/mission/weather/{weather}.svg" class="weather-img" alt="" />
	<img src="/assets/mission/tier{tier}.svg" class="tier-img" alt="" />
	<div class="plant-box">
		<img src="/assets/mission/{material}.png" alt="" />
	</div>
	<div style="z-index: 1;">{reward}/hr</div>
	<div style="z-index: 1;text-transform: uppercase;">{tokens[material.toUpperCase()]}</div>
	<div class="plant-name">{mission.name}</div>
	<div class="rates">
		<div class="item">
			<img src={SuccessRateImg} alt="" />
			<span>{successRate}%</span>
		</div>
		<div class="item">
			<img src={UnionImg} alt="" />
			<span>{injuryRate}%</span>
		</div>
		<div class="item">
			<img src={PlantImg} alt="" />
			<span>{luck}%</span>
		</div>
		<div class="item">
			<img src={ClockImg} alt="" />
			<span>{duration}h</span>
		</div>
	</div>
	{#if locked}
		<div class="locked flex center" />
		<div class="flex center lock-icon">
			<img src="/assets/mission/img-lock.png" alt="" />
		</div>
	{/if}
</div>

<style>
	.blockedCursor {
		cursor: not-allowed !important;
	}
	.locked {
		position: absolute;
		height: 100%;
		width: 100%;
		opacity: 0.5;
		background: black;
		z-index: 1;
		clip-path: polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 8%);
		min-height: 226px;
		margin-top: -1px;
	}
	.lock-icon {
		position: absolute;
		height: 100%;
		width: 100%;

		z-index: 2;
		clip-path: polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 8%);
		min-height: 226px;
		width: 332px;
	}
	.container {
		transition: all 0.2s ease-in-out;
		min-height: 226px;
		background: url('/game_assets/missions/missionRect.svg');
		background-repeat: no-repeat;
		background-size: cover;
		position: relative;
		padding: 1px;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		font-weight: 600;
		scale: 0.9;
	}

	.card-img {
		width: 99.5%;
		position: absolute;
		top: 1px;
		left: 1px;
		clip-path: polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 10%);
		height: 165px;
		opacity: 0.6;
	}

	.weather-img {
		position: absolute;
		top: 12px;
		left: 15px;
		width: 45px;
	}

	.tier-img {
		position: absolute;
		top: 0px;
		right: 15px;
		width: 50px;
	}

	.plant-box {
		z-index: 1;
		margin-top: -8px;
		/* 	background: rgba(0, 0, 0, 0.5); */
		padding: 15px 10px;
		/* clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); */
		/* margin-bottom: 0px; */
	}
	.plant-box img {
		max-width: 66px;
	}

	.plant-name {
		font-size: 20px;
		z-index: 1;
	}

	.rates {
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 5px 4px;
		align-items: center;
	}

	.rates .item {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 77px;
		background: #111;
		border-radius: 5px;
		font-size: 14px;
		padding: 7px 0;
	}

	.rates .item img {
		height: 30px;
	}

	.active {
		scale: 1;
	}
	.wrap {
		color: white;
		display: flex;
		flex-direction: column;
	}
	.wrap span {
	}
</style>
