<script>
	import Character2 from '../../../static/assets/mission/character2.png';
	import btnSuccess from '../../../static/assets/mission/btn_success.png';
	import Ellipse from '../../../static/assets/mission/Ellipse.png';
	import expText from '../../../static/assets/mission/exp_text.png';
	import btnFailed from '../../../static/assets/mission/btn_failed.png';
	import Injured from '../../../static/assets/mission/injured.png';
	import Plus from '../../../static/assets/mission/plus.png';
	import { missions } from 'src/stores/missionStores';
	import MissionTimer from '../MissionTimer.svelte';
	import CtaButton from '../CTAButton.svelte';
	import { getMissionImg } from 'src/utils/helpers';

	export let slotData;
	export let onClaim;

	$: missionDetails = slotData ? $missions.filter((e) => e.id == slotData.mission_id)[0] : null;
	$: weather = slotData?.weather;
	$: current_weather = missionDetails.weather_options.find((wo) => wo.key === weather).value;
	$: missionImg = getMissionImg(missionDetails.name);
	$: missionStatus = slotData.outcomes.filter((e) => e.key == 'mission outcome')[0].value;
	$: health = slotData.outcomes.filter((e) => e.key == 'injury outcome')[0].value;
	$: material = missionDetails.materials[0].token.split(' ')[1].toLowerCase();

	function gotBonus(material) {
		return material?.bonus ?? false;
	}

	function getSymbol(asset) {
		return asset.split(' ')[1];
	}

	function getRewardAmount(material) {
		let symbol = getSymbol(material.amount);

		let materialConfig = missionDetails.materials.find((mat) => {
			return getSymbol(mat.token) === symbol;
		});

		const missionHours = current_weather.base_mission_duration / 3600;
		return (materialConfig.base_amount * missionHours) / 10000;
	}

	function getBonusAmount(material) {
		let symbol = getSymbol(material.amount);

		let materialConfig = missionDetails.materials.find((mat) => {
			return getSymbol(mat.token) === symbol;
		});

		return materialConfig.bonus_amount / 10000;
	}
</script>

{#if missionStatus == 'success'}
	<div class="content">
		<div
			class="top"
			style="background: url('/assets/mission/{missionImg}_{weather}.png'); 	background-repeat: no-repeat;
		background-size: cover;"
		>
			<p class="top-text">{slotData.characterData.name} has returned!</p>
			<img alt="btn success" src={btnSuccess} class="bt n-success" style="z-index:2;" />
		</div>
		<div class="shader" />
		<div class="bottom">
			<div class="b-left">
				<img
					src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/unframed/{slotData
						.characterData.data.img}.png"
					class="character"
					alt="character"
				/>
				{#if health == 'injured'}
					<div>
						<img src={Injured} class="injured" alt="injured" />
						<div>
							<img src={Plus} class="plus" alt="plus" />
							<p class="time">
								<MissionTimer start={Number(slotData.characterData.data.Cooldown)} />
							</p>
						</div>
					</div>
				{/if}
			</div>
			<div class="b-right">
				<div class="ellipse">
					<div class="ellipse-group">
						<div class="ellipse-item">
							<img src={Ellipse} class="ellipse-img" alt="ellipse-img" />
							<img src={expText} class="ellipse-text" alt="ellipse-text" />
						</div>
						<div class="ellipse-footer">
							<p>{current_weather.base_success_exp}</p>
						</div>
					</div>
					<div class="ellipse-group">
						<div class="ellipse-item">
							<img src={Ellipse} class="ellipse-img" alt="ellipse-img" />
							<img class="mat" src="/assets/mission/{material}.png" alt="" />
						</div>
						<div class="ellipse-footer">
							{#each slotData?.materials as material, idx}
								<p>
									{getRewardAmount(material)}
									{#if gotBonus(material)}
										<span class="bonus">+{getBonusAmount(material)}</span>
									{/if}
								</p>
							{/each}
						</div>
					</div>
				</div>
				<CtaButton
					width="195px"
					height="45px"
					fontSize="16px"
					text="claim"
					onClick={() => {
						onClaim(slotData);
					}}
				/>
			</div>
		</div>
	</div>
{:else}
	<div class="container">
		<div class="wrapper">
			<div class="content">
				<div
					class="top"
					style="background: url('/assets/mission/{missionImg}_{weather}.png'); 	background-repeat: no-repeat;
				background-size: cover;"
				>
					<p class="top-text">{slotData.characterData.name} has returned!</p>
					<img alt="btn failed" src={btnFailed} />
				</div>
				<div class="shader" />
				<div class="bottom">
					<div class="b-left">
						<img
							src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/unframed/{slotData
								.characterData.data.img}.png"
							class="character"
							alt="character"
						/>
						{#if health == 'injured'}
							<img src={Injured} class="injured" alt="injured" />
							<img src={Plus} class="plus" alt="plus" />
							<p class="time"><MissionTimer start={slotData.characterData.data.Cooldown} /></p>
						{/if}
					</div>
					<div class="b-right">
						<div class="ellipse">
							<div class="ellipse-group">
								<div class="ellipse-item">
									<img src={Ellipse} class="ellipse-img" alt="ellipse-img" />
									<img src={expText} class="ellipse-text" alt="ellipse-text" />
								</div>
								<div class="ellipse-footer">
									<p>{current_weather.base_fail_exp}</p>
								</div>
							</div>
							<div class="ellipse-group">
								<div class="ellipse-item">
									<img src={Ellipse} class="ellipse-img" alt="ellipse-img" />
									<img class="mat" src="/assets/mission/{material}.png" alt="" />
								</div>
								<div class="ellipse-footer">
									<p>0</p>
								</div>
							</div>
						</div>
						<CtaButton
							width="195px"
							height="45px"
							fontSize="16px"
							text="claim"
							onClick={() => {
								onClaim(slotData);
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.shader {
		position: absolute;
		height: 47%;
		width: 99%;
		background: linear-gradient(180deg, #000 -2.12%, rgba(0, 0, 0, 0) 77.99%);
	}
	.bonus {
		color: #36ffc0;
	}
	.mat {
		position: absolute;
		top: 10px;
		max-width: 69px;

		margin-left: 8px;
	}

	.bottom {
		height: 53%;
		width: 100%;
		display: flex;
	}
	.b-left {
		width: 50%;
		height: 100%;
		display: flex;
		justify-content: center;
	}
	.b-right {
		width: 50%;
		height: 100%;
	}
	.character {
		width: 80%;
		height: 120%;
		position: relative;
		top: -80px;
		left: 20px;
		object-fit: scale-down;
	}
	.content {
		width: 750px;
		height: 510px;
		/* border: 2px solid #36ffc0; */
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		color: white;
	}
	.e-btn {
		width: 195px;
		height: 45px;
		background-color: #36ffc0;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.ellipse {
		height: 68%;
		align-items: center;
		display: flex;
	}
	.ellipse-footer {
		height: 90px;
		align-items: center;
		display: flex;
		font-size: 20px;
		font-weight: bold;
		justify-content: center;
	}
	.ellipse-group {
		margin-right: 40px;
	}
	.ellipse-item {
		margin-top: 45px;
		position: relative;
	}

	.ellipse-text {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		position: absolute;
	}
	.top {
		height: 47%;
		width: 100%;

		background-size: cover;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.top-text {
		font-size: 18px;
		margin-bottom: 15px;
		font-weight: bold;
		z-index: 2;
		text-align: center;
	}

	.wrapper {
		max-width: 1440px;
		color: white;
		width: 100%;
		display: flex;
		align-items: center;
		height: 100%;
		margin: 0 auto;
	}
	/* 	.container {
		height: 90vh;
		background: url('/assets/mission/bg119.png');
		background-repeat: no-repeat;
		background-size: cover;
	} */

	@media (max-width: 550px) {
		.b-left {
			width: 70%;
			margin: 0 auto;
		}
		.b-right {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.bottom {
			height: 76%;
			flex-direction: column;
		}
		.character {
			top: 0;
			left: 0;
		}
		.content {
			height: 100%;
		}
		.container {
			height: 110vh;
		}
		.ellipse {
			width: 70%;
			margin-top: 18px;
			display: flex;
			justify-content: space-around;
		}
		.ellipse-group {
			margin-right: 0;
		}
	}
	.bottom {
		height: 53%;
		width: 100%;
		display: flex;
	}
	.b-left {
		width: 50%;
		height: 100%;
		display: flex;
		justify-content: center;
		position: relative;
	}
	.b-right {
		width: 50%;
		height: 100%;
	}
	.character {
		width: 80%;
		height: 120%;
		position: relative;
		top: -80px;
		left: 20px;
	}
	.content {
		width: 750px;
		height: 510px;

		margin: 0 auto;
		display: flex;
		flex-direction: column;
	}
	.e-btn {
		width: 195px;
		height: 45px;
		background-color: #36ffc0;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.ellipse {
		height: 68%;
		align-items: center;
		display: flex;
	}
	.ellipse-footer {
		height: 90px;
		align-items: center;
		display: flex;
		font-size: 20px;
		font-weight: bold;
		justify-content: center;
	}
	.ellipse-group {
		margin-right: 40px;
	}
	.ellipse-item {
		margin-top: 45px;
		position: relative;
	}

	.ellipse-text {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		position: absolute;
	}
	.injured {
		position: absolute;
		max-width: 304px;
		height: 70px;
		top: 28%;
		left: 10%;
	}
	.plus {
		position: absolute;
		top: 35%;
		left: 33%;
	}
	.time {
		position: absolute;
		top: 40%;
		left: 42%;
	}
	.top {
		height: 47%;
		width: 100%;
		background: url('/assets/mission/bg119_top.png');
		background-size: cover;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.top-text {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 15px;
		text-align: center;
	}

	.wrapper {
		max-width: 1440px;
		color: white;
		width: 100%;
		display: flex;
		align-items: center;
		height: 100%;
		margin: 0 auto;
	}

	@media (max-width: 550px) {
		.b-left {
			width: 70%;
			margin: 0 auto;
		}
		.b-right {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			height: 272px;
		}
		.bottom {
			height: 76%;
			flex-direction: column;
		}
		.character {
			top: 0;
			left: 0;

			max-height: 254px;
			margin-top: -90px;
		}
		.content {
			height: 100%;
		}
		.container {
			height: 110vh;
		}
		.ellipse {
			width: 70%;
			margin-top: -8px;
			display: flex;
			justify-content: space-around;
		}
		.ellipse-group {
			margin-right: 0;
		}
		.injured {
			top: 50%;
			left: 50%;
			transform: translate(-50%, 25%);
		}
		.plus {
			top: 74%;
			left: 20%;
		}
		.time {
			top: 83%;
			left: 40%;
		}
	}
	@media (max-width: 400px) {
		.plus {
			top: 74%;
		}
		.time {
			top: 83%;
			left: 40%;
		}
	}
	@media (min-width: 551px) and (max-width: 768px) {
		.injured {
			left: 10%;
		}
		.plus {
			left: 33%;
		}
		.time {
			left: 42%;
		}
	}
	@media (max-width: 768px) {
		.content {
			width: 100%;
		}

		.top {
			height: 290px;
		}
	}
</style>
