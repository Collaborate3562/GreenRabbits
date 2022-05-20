<script>
	import { missions } from 'src/stores/missionStores';
	import { activeUser, now } from 'src/stores/store';
	import { MATS_CONTRACT } from 'src/utils/config';
	import { getMissionImg } from 'src/utils/helpers';
	import MissionTimer from '../MissionTimer.svelte';

	export let mission;
	export let gotoMap;
	export let handleEndMission;
	export let handleRetryRng;

	$: missionDetails = mission ? $missions.filter((e) => e.id == mission.mission_id)[0] : null;

	async function handleClick() {
		if (!mission?.active) {
			gotoMap(mission);
		}
	}

	$: missionEnded = mission?.active && mission?.end_time > 0 && mission?.end_time <= $now;
	$: missionStarted =
		mission?.active &&
		mission?.start_time <= $now &&
		(mission?.end_time === 0 || mission?.end_time >= $now);
	$: missionImg = getMissionImg(missionDetails?.name);
	$: weather = missionDetails?.current_weather?.key;
	$: halfMission = mission?.active && mission?.start_time + mission?.duration / 2 <= $now;

	$: showRetryRng = mission?.active && mission?.duration === 0;

	function getMissionText($now) {
		let chunk = mission?.duration / 4;

		if (mission?.start_time + chunk > $now) return 'Travelling to Forage';
		if (mission?.start_time + chunk + chunk + chunk > $now) return 'Foraging for Materials';
		if (mission?.start_time + mission?.duration > $now) return 'Returning from Mission';
	}
	let missionText = '';
	$: {
		if (mission?.active) missionText = getMissionText($now);
	}
</script>

{#if mission}
	{#if missionStarted || !mission?.active}
		<div class="clip-wrap" on:click={handleClick}>
			<div class="clip-each">
				{#if mission?.active}
					<div class="mission-card">
						<div class="img-wrap">
							<img class="mission-banner" src="/assets/mission/{missionImg}_{weather}.png" alt="" />
							<div class="img-overlay" />
						</div>

						<div class="mission-name">{missionDetails?.name}</div>

						<div class="mission-timer">
							<img
								class="samil-head"
								src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/thumbs/{mission
									.characterData.data.img}.png"
								alt=""
							/>
							{#if showRetryRng}
								<div class="retry-rng-container">
									<div
										class="retry-rng-btn"
										on:click={() => {
											handleRetryRng(mission);
										}}
									>
										{'RETRY RNG'}
									</div>
								</div>
							{:else}
								<div class="mission-detail">
									<span class="mission-text">{missionText}</span>
									<div class="timer">
										<img src="/assets/mission/timer.svg" alt="" />
										<MissionTimer start={mission?.end_time} />
									</div>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<img src="/assets/mission/add.svg" alt="" />
				{/if}
			</div>
		</div>
	{:else if missionEnded}
		<div class="rectangle">
			<img
				class="samil-head"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/thumbs/{mission
					.characterData.data.img}.png"
				alt=""
			/>
			<div class="rectangle-text">Your Forager has returned!</div>
			<div
				class="rectangle-btn"
				on:click={() => {
					handleEndMission(mission);
				}}
			>
				{mission.outcomes.length > 0 ? 'CLAIM REWARDS' : 'VIEW RESULTS'}
			</div>
		</div>
	{/if}
{/if}

<style>
	.timer {
		display: flex;
		flex-direction: row;
		padding: 5px;
	}
	.timer img {
		margin-right: 5px;
	}
	.mission-text {
		font-family: Lato;
		font-style: normal;
		font-weight: bold;
		font-size: 16px;
		line-height: 18px;
		margin-left: 5px;
	}
	.img-overlay {
		position: absolute;
		width: 98%;
		height: 154px;
		background: linear-gradient(360deg, #000000 5%, rgba(0, 0, 0, 0) 75.84%);
		opacity: 0.7;
		top: 0;
	}
	.samil-head {
		height: 48px;
		margin-left: 10px;
	}
	.mission-detail {
		display: flex;
		flex-direction: column;
	}
	.rectangle {
		background-image: url('/assets/mission/Rectangle_white.png');
		background-size: cover;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 257px;
		margin-left: 10px;
		height: 239px;
		margin: 10px;
	}
	.rectangle-btn {
		width: 175px;
		height: 39px;
		background-color: #44be98;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: 'Lato';
		font-size: 16px;
		cursor: pointer;
		background-color: #44be98;
	}

	.retry-rng-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.retry-rng-btn {
		background-color: #44be98;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: 'Lato';
		font-size: 16px;
		cursor: pointer;
		background-color: #44be98;
		padding: 7px 20px;
	}

	.rectangle-head {
		width: 65px;
		height: 66px;
	}
	.rectangle-text {
		padding-top: 14px;
		width: 80%;
		font-family: 'Lato';
		font-size: 18px;
		text-align: center;
		height: 66px;
		line-height: 17px;
	}

	.clip-wrap {
		display: inline-block;
		padding: 10px;
		cursor: pointer;
		text-align: center;
	}
	.clip-each {
		width: 257px;
		height: 240px;
		position: relative;
		background-image: url('/assets/mission/squre.png');
		clip-path: polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%);
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.btn-add {
		color: #36ffc0;
		position: relative;
		z-index: 10;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border-color: #36ffc0;
		border-width: 3px;
		font-size: 39px;
		font-weight: 900;
		background: transparent;
	}
	.mission-card {
		height: 100%;
		padding: 3px;
		clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%, 0 14%);
	}
	.mission-banner {
		min-height: 151px;
		width: auto;
		object-fit: cover;
		border-bottom: 3px solidblack;
	}
	.mission-name {
		margin-top: -30px;
		font-family: Lato;
		font-style: normal;
		font-weight: bold;
		font-size: 18px;
		line-height: 22px;
		display: flex;
		align-items: left;
		padding-left: 20px;
		color: #ffffff;
		position: absolute;
		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	}

	.mission-timer {
		margin-top: 15px;
		display: flex;
	}
	@media only screen and (min-width: 769px) and (max-width: 1366px) {
		.rectangle {
			width: auto;
			height: auto;
			padding: 5px;
		}
		.rectangle-btn {
			width: auto;
			height: auto;
			padding: 5px;
		}
		.rectangle-text {
			height: auto;
			width: 100%;
		}
	}

	@media only screen and (max-width: 768px) {
		.rectangle {
			/* width: 257px; */
			padding-left: 41px;
			padding-right: 41px;
			height: 240px;
		}
	}
</style>
