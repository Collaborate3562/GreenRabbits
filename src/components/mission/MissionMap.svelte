<script>
	import Panzoom from '@panzoom/panzoom';
	import { missions, materialBalances } from 'src/stores/missionStores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MissionCarousel from './MissionCarousel.svelte';
	import CheckBox from '../misc/CheckBox.svelte';
	import BackButton from '../staking/BackButton.svelte';
	import BackButtonMobile from '../misc/BackButtonMobile.svelte';
	import MissionCard from './MissionCard.svelte';
	import PlantsFloria from '../../../static/assets/mission/Plants_Floria.png';
	import PlantsNanore from '../../../static/assets/mission/Plants_Nanore.png';
	import PlantsSap from '../../../static/assets/mission/Plants_Sap.png';
	import PlantsVersatopium from '../../../static/assets/mission/Plants_Versatopium.png';

	import Solkens from '../../../static/assets/mission/Solken_Token.png';

	import { getContext } from 'svelte';
	import MissionModal from './MissionModal.svelte';

	import Snowstorm from 'src/modules/Snowstorm.svelte';
	import { now } from 'src/stores/store';

	export let startMission;
	export let character;
	export let gotoMain;
	const { open, close } = getContext('simple-modal');
	let map;
	let showLabels = true;
	var panzoom2;
	let carousel;
	let carouselIndex = 0;

	let selectedIndex = 0;
	let mapWidth;
	let mapHeight;
	let mapContainerWidth;
	let mapContainerHeight;
	let imgwidth = 4096;
	let imgheight = 2473;
	let missionsLoaded = false;
	let innerWidth, innerHeight;

	function shouldRenderSnow($now) {
		return $now > 1639785600 && $now < 1640995200;
	}

	$: renderSnow = shouldRenderSnow($now);

	function shouldShowSOL($now) {
		return $now > 1639785600;
	}

	$: showSol = shouldShowSOL($now);

	onMount(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		let desktop = {
			contain: 'outside',
			startScale: 0.5,
			startX: -(imgwidth / 2 - innerWidth / 2) * (1 / 0.5),
			startY: -(imgheight / 2 - innerHeight / 2 + 150) * (1 / 0.5)
		};
		let mobile = {
			contain: 'outside',
			startScale: 0.25,
			startX: -(imgwidth / 2 - innerWidth / 2) * (1 / 0.25),
			startY: -(imgheight / 2 - innerHeight / 2 + 150) * (1 / 0.25)
		};

		panzoom2 = Panzoom(map, innerWidth > 768 ? desktop : mobile);

		map.parentElement.addEventListener('wheel', panzoom2.zoomWithWheel);

		let index = 0;

		for (let mission of $missions) {
			if (mission.metadata != '') {
				const metadata = JSON.parse(mission.metadata);
				mission.pin = {
					class: getMissionPinClass(mission, metadata),
					xPercent: metadata.x,
					yPercent: metadata.y,
					index
				};
			}

			index++;
		}

		missionsLoaded = true;
	});

	function getMissionPinClass(mission, metadata) {
		if (metadata?.pin) {
			return `tier${metadata?.pin}`;
		}

		let tier = 1;

		switch (mission.level_requirement) {
			case 1:
				tier = 1;
				break;
			case 10:
				tier = 2;
				break;
			case 25:
				tier = 3;
				break;
		}

		return `tier${tier}`;
	}

	function closeModal() {
		close();
	}
	function openModal(mission) {
		open(
			MissionModal,
			{ mission, startMission, closeModal, character },
			{
				styleContent: {
					padding: 0
				},
				styleWindow: {
					border: 0,
					backgroundColor: 'transparent'
				},
				styleWindowWrap: {
					margin: 0
				}
			}
		);
	}

	function getMap($now) {
		if ($now >= 1639785600 && $now < 1640908800) {
			return 'sol-map';
		} else if ($now >= 1640908800 && $now < 1640995200) {
			return 'sol-special-map';
		}

		return 'default-map';
	}

	let mapImage = '';
	$: {
		mapImage = getMap($now);
	}

	function missionSort(a, b) {
		if (a.type === 'Seasonal') {
			return -1;
		}

		return 0;
	}

	function missionFilter(_now, m) {
		if (!m.active) return false;
		if (m.unlock_at > Number(_now)) return false;

		return true;
	}

	let localMissions = [];

	$: {
		localMissions = $missions.sort(missionSort).filter(missionFilter.bind(null, $now));
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div class="map-container">
	<div
		id="mission-map"
		class="map"
		bind:this={map}
		bind:clientHeight={mapContainerHeight}
		bind:clientWidth={mapContainerWidth}
	>
		<div
			style="position:absolute;width:{imgwidth}px;height:{imgheight}px;"
			bind:clientHeight={mapHeight}
			bind:clientWidth={mapWidth}
		>
			<img src="game_assets/missions/{mapImage}.jpg" class="image" alt="Map" />
		</div>

		{#if showLabels}
			<img
				transition:fade|local
				src="/game_assets/missions/labels_new.png"
				class="image2"
				alt="Labels"
			/>
		{/if}
		{#if missionsLoaded}
			<div class="pin-wrap">
				{#each localMissions as mission}
					<img
						on:click={() => {
							carousel.go(mission?.pin?.index);
							selectedIndex = mission?.pin?.index;
						}}
						src="/game_assets/missions/{mission.pin?.class}.svg"
						class="pin"
						style="top:{(mission?.pin?.yPercent / 100) * mapHeight}px;left:{(mission?.pin
							?.xPercent /
							100) *
							mapWidth}px;"
						alt={(mission?.pin?.class + ' x ' + mission?.pin?.xPercent + ' y ',
						mission?.pin?.yPercent)}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<div class="top-bar">
		<div class="back-btn">
			<BackButton
				width="117px"
				text="BACK"
				onClick={() => {
					gotoMain();
				}}
			/>
		</div>

		<div class="menu">
			<div class="menu-item">
				<img src={PlantsFloria} alt="PlantsFloria" class="menu-img" />
				<span>{$materialBalances?.FLORIA}</span>
			</div>
			<div class="menu-item">
				<img src={PlantsSap} alt="PlantsSap" class="menu-img" />
				<span>{$materialBalances?.SAP}</span>
			</div>
			<div class="menu-item">
				<img src={PlantsVersatopium} alt="PlantsVersatopium" class="menu-img" />
				<span>{$materialBalances?.VERSAT}</span>
			</div>
			<div class="menu-item">
				<img src={PlantsNanore} alt="PlantsNanore" class="menu-img" />
				<span>{$materialBalances?.NANORE}</span>
			</div>
			{#if showSol}
				<div class="menu-item">
					<img src={Solkens} alt="Solkens" class="menu-img" style="max-width:45px;" />
					<span>{$materialBalances?.SOL}</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="top-bar-mobile">
		<div class="back-btn-mobile">
			<BackButtonMobile
				text="BACK"
				onClick={() => {
					gotoMain();
				}}
			/>
		</div>

		<CheckBox bind:checked={showLabels} label="Show Names" />
	</div>

	<div class="controls">
		<CheckBox bind:checked={showLabels} label="Show Names" />
	</div>

	<div class="cards">
		<MissionCarousel
			missions={localMissions}
			{character}
			bind:this={carousel}
			onCardClick={(mission, index) => {
				selectedIndex = index;
				openModal(mission);
			}}
			{selectedIndex}
		>
			<div slot="left-control" class="nav-btn flex center unselectable">
				<img src="/icons/chevron-left.svg" alt="" />
			</div>

			<div slot="right-control" class="nav-btn flex center unselectable">
				<img src="/icons/chevron-right.svg" alt="" />
			</div>
		</MissionCarousel>
	</div>

	{#if renderSnow}
		<Snowstorm />
	{/if}
</div>

<style>
	.top-bar {
		position: absolute;
		top: 5%;
		left: 0px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding-left: 150px;
	}

	.menu {
		display: flex;
		align-items: center;
	}
	.menu-item {
		display: flex;
		align-items: center;
		margin-right: 40px;
	}
	.nav-btn {
		width: 48px;
		height: 48px;

		background: rgba(0, 0, 0, 0.8);
		border: 2px solid #36ffc0;
		box-sizing: border-box;
		cursor: pointer;
		z-index: 5;
		position: absolute;
	}
	.menu-item span {
		width: 66px;
		height: 34px;
		line-height: 34px;
		background-color: #111111;
		color: #fff;
		font-weight: bold;
		text-align: center;
		border-radius: 2px;
		border: 1px solid #222222;
		margin-left: 8px;
	}
	.cards {
		display: block;
		position: absolute;
		bottom: 0px;
		left: 0px;
		right: 0px;
	}

	.controls {
		position: absolute;
		right: 0;
		color: white;
		margin-right: 20px;
		margin-top: -100px;
	}

	.image2 {
		position: absolute;
	}

	.pin-wrap {
		position: relative;
		/* transform: translate(-50%, -50%); */
		/* 	min-height: calc(100vh - 173px);
		max-height:100%; */
		display: flex;
		justify-content: center;
		width: 100%;
		min-height: 76vh;
	}
	.pin {
		position: absolute;
		cursor: pointer !important;
		transition: all 0.2s ease-in-out;

		width: 61px;
		height: 126.2px;
		/* transform: translate(5px, 15px); */
		/* transform: translate(-5px, -18px); */
		transform: translate(-15px, -30px);
	}
	.pin:hover {
		/* scale: 1.5; */
		transform: translate(-15px, -30px) scale(1.2);
	}

	.map-container {
		position: relative;
		margin-top: -55px;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		background-color: rgba(0, 0, 0, 0.3);
		background-blend-mode: soft-light;

		/* min-height: calc(100vh - 173px); */
		max-height: calc(100vh - 173px);

		/* max-height: calc(100vh); */

		background: black;

		overflow: hidden;
	}

	.map {
		position: relative;
		display: flex;
		justify-content: center;

		width: 4096px;
		height: 2473px;
	}

	.top-bar-mobile {
		display: none;
	}

	.back-btn-mobile {
		display: none;
	}

	@media only screen and (max-width: 768px) {
		.map-container {
			background-size: 100% 60%;
			background-position: top;
			background-color: black;

			max-height: calc(100vh);
		}
		.pin {
			/* width: 10px; */
		}

		.top-bar {
			/* padding-left: 10px; */
			display: none;
		}

		.top-bar-mobile {
			position: absolute;
			top: 70px;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
			color: #fff;
			padding: 0px 10px;
		}

		.map {
			/* position: relative;
			height: 100vh;
			min-height: 100vh;
			margin-top: 0px; */
		}

		.controls {
			display: none;
		}

		.cards {
			display: block;
			position: absolute;
			bottom: 0px;
			left: 0px;
			right: 0px;
			margin-left: 0px;
			margin-bottom: 20px;
		}

		.back-btn {
			display: none;
		}

		.back-btn-mobile {
			display: block;
		}
	}
</style>
