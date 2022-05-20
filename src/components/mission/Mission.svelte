<script>
	import Character from '../../../static/assets/mission/character.png';
	import PlantsFloria from '../../../static/assets/mission/Plants_Floria.png';
	import PlantsNanore from '../../../static/assets/mission/Plants_Nanore.png';
	import PlantsSap from '../../../static/assets/mission/Plants_Sap.png';
	import PlantsVersatopium from '../../../static/assets/mission/Plants_Versatopium.png';
	import Solkens from '../../../static/assets/mission/Solken_Token.png';

	import { SplideSlide } from '@splidejs/svelte-splide';

	import Symbol from '../../../static/assets/mission/symbol.png';
	// import Arrow from '../../../static/assets/mission/arrow.png';
	import Shape1 from '../../../static/assets/mission/Shape1.png';
	import Shape2 from '../../../static/assets/mission/Shape2.png';
	import Shape3 from '../../../static/assets/mission/Shape3.png';

	import Square from './Square.svelte';
	import SquareLock from './SquareLock.svelte';
	import Carousel from '../Carousel.svelte';
	import {
		allChars,
		characters,
		inStats,
		loading,
		materialBalances,
		missions,
		missionsActivated,
		missionSlots
	} from 'src/stores/missionStores';
	import { activeUser, isDataLoading, now } from 'src/stores/store';
	import {
		enoughExpToLevel,
		getTotalExp,
		requiredExpToLevel,
		resolveAfterMS
	} from 'src/utils/helpers';
	import CharacterCard from './CharacterCard.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import LevelIcon from '../icons/LevelIcon.svelte';
	import MissionMap from './MissionMap.svelte';
	import LevelCard from './LevelCard.svelte';
	import CtaButton from '../CTAButton.svelte';
	import { MATS_CONTRACT, TESTNET, TOKEN_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import { chain } from 'src/utils/chain';
	import MissionEnd from './MissionEnd.svelte';
	import BackButton from '../staking/BackButton.svelte';
	import BackButtonMobile from '../misc/BackButtonMobile.svelte';
	import LoaderDots from '../misc/LoaderDots.svelte';

	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import { getContext, onMount } from 'svelte';

	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';

	const { open, close } = getContext('simple-modal');

	let characterIndex = 0;
	$: character = $allChars[characterIndex];
	$: mintNum = character?.template_mint;

	let screen = 'main';
	let subPage = 'slots';
	let selectedMissionSlot;
	let selectedMission;
	let showStats = character && true;
	let carousel;

	$: name = character?.data.name;

	$: cooldown = character?.mutable_data?.Cooldown;
	$: injured = cooldown && Number(cooldown) > $now;

	$: level = character?.mutable_data?.Level || 1;
	$: exp = character?.mutable_data?.Experience || 0;

	$: base_strength = Number(character?.data['Base Strength']);
	$: base_speed = Number(character?.data['Base Speed']);
	$: base_luck = Number(character?.data['Base Luck']);

	$: additional_strength = Number(character?.mutable_data?.Strength ?? 0);
	$: additional_speed = Number(character?.mutable_data?.Speed ?? 0);
	$: additional_luck = Number(character?.mutable_data?.Luck ?? 0);

	$: hasStats = additional_luck || additional_speed || additional_luck;
	$: strength = base_strength + additional_strength;
	$: speed = base_speed + additional_speed;
	$: luck = base_luck + additional_luck;

	$: attrib_pts = Number(character?.mutable_data?.['Attribute Points'] ?? 0);

	$: hasAssignedPts =
		level > 1 && (additional_strength > 0 || additional_speed > 0 || additional_luck > 0);

	$: expToLevel = requiredExpToLevel(exp, level);
	$: totalExp = getTotalExp(exp, level);

	$: canLevelUp = enoughExpToLevel(exp, level);

	$: {
		if (character) {
			handleChange();
		}
	}

	$: {
		$inStats = subPage == 'stats';
	}

	function shouldShowSOL($now) {
		return $now > 1639785600;
	}

	$: showSol = shouldShowSOL($now);

	async function handleClaimRewards(slot) {
		const user = $activeUser?.accountName;

		let actions = [
			{
				account: MATS_CONTRACT,
				name: 'missionclaim',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user: $activeUser.accountName,
					mission_slot_id: slot.id
				}
			}
		];

		let trx = {
			actions
		};

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});
			close();
			$loading = true;
			$isDataLoading = true;
			open(AwaitingAuth);
			setTimeout(() => {
				window.reloadMissions(() => {
					$loading = false;
					$isDataLoading = false;
					close();
				});
			}, TRANSACTION_TIMEOUT_MS + 5000);
		} catch (err) {
			console.error(err);
			$loading = false;
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	async function handleChange() {
		showStats = false;
		setTimeout(() => {
			showStats = character && true;
		}, 500);
	}

	async function gotoMap(missionSlot) {
		/* 		console.log('map switch'); */
		screen = 'map';
		selectedMissionSlot = missionSlot;
	}
	async function gotoMain() {
		screen = 'main';
		characterIndex = 0;
	}
	async function getStarted() {
		let transaction = {
			actions: [
				{
					account: MATS_CONTRACT,
					name: 'getstarted',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName
					}
				}
			]
		};

		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			$loading = true;
			$isDataLoading = true;
			open(AwaitingAuth);
			setTimeout(() => {
				window.reloadMissions(() => {
					$isDataLoading = false;
					$loading = false;
					close();
				});
			}, TRANSACTION_TIMEOUT_MS * 2);
		} catch (err) {
			close();
			$loading = false;
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	async function startMission(mission) {
		/* 	console.log('Selected Character:', character);
		console.log('Selected Mission:', mission); */
		if (!character) {
			window.pushToast('No character selected', 'error', 'Transaction error', 6);
			close();

			return;
		}
		if (character.Cooldown > $now) {
			window.pushToast('Character is on cooldown', 'error', 'Transaction error', 6);
			close();

			return;
		}
		if (character?.onMission) {
			window.pushToast('Character is on a mission', 'error', 'Transaction error', 6);
			close();

			return;
		}
		const user = $activeUser?.accountName;

		const missionSlotId = selectedMissionSlot.id;
		const missionId = mission.id;

		let actions = [
			{
				account: 'atomicassets',
				name: 'transfer',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: $activeUser.accountName,
					to: MATS_CONTRACT,
					asset_ids: [character.asset_id],
					memo: `startmission|${missionSlotId}|${missionId}`
				}
			},

			{
				account: TOKEN_CONTRACT,
				name: 'transfer',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					from: $activeUser.accountName,
					to: MATS_CONTRACT,
					quantity: mission.current_weather.fee,
					memo: `missionfee|${selectedMissionSlot.id}`
				}
			}
		];

		let trx = {
			actions
		};
		console.dir(trx);

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});
			close();

			gotoMain();
			setTimeout(() => {
				open(AwaitingAuth);
			}, 500);
			$loading = true;
			$isDataLoading = true;
			console.dir(result);

			waitForMissionDuration(selectedMissionSlot.id);

			setTimeout(() => {
				window.refreshBalance();
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			console.error(err);
			$loading = false;
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
	async function waitForMissionDuration(missionSlotId) {
		let gotDuration = false;

		while (!gotDuration) {
			await resolveAfterMS(2000);

			let res = await chain.post('/v1/chain/get_table_rows', {
				code: MATS_CONTRACT,
				scope: MATS_CONTRACT,
				table: 'missionslots',
				limit: 1,
				lower_bound: missionSlotId,
				upper_bound: missionSlotId,
				json: true
			});

			if (res.rows[0].duration > 0) {
				gotDuration = true;
				break;
			}
		}

		setTimeout(() => {
			window.reloadMissions(() => {
				$isDataLoading = false;
				$loading = false;
				close();
			});
			window.refreshBalance();
			characterIndex = 0;
		}, TRANSACTION_TIMEOUT_MS + 3000);
	}

	async function handleRetryRng(slot) {
		const user = $activeUser?.accountName;

		let actions = [
			{
				account: MATS_CONTRACT,
				name: 'retrystart',
				authorization: [
					{
						actor: user,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user: user,
					mission_slot_id: slot.id
				}
			}
		];

		let trx = { actions };

		try {
			await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});

			$loading = true;
			$isDataLoading = true;

			open(AwaitingAuth);

			waitForMissionDuration(slot);
		} catch (err) {
			console.error(err);
			window.pushToast(err.message, 'error', 'Transaction error', 6);

			window.reloadMissions(() => {
				$isDataLoading = false;
				$loading = false;
				close();
			});
		}
	}

	async function handleEndMission(slot) {
		const missionDetails = slot ? $missions.filter((e) => e.id == slot.mission_id)[0] : null;
		/* 	console.log('Mission Slot:', slot, missionDetails); */
		if (slot.outcomes.length > 0) {
			open(
				MissionEnd,
				{ slotData: slot, onClaim: handleClaimRewards },
				{
					styleContent: {
						padding: 0
					},
					styleWindow: {
						width: '760px'
					},
					styleWindowWrap: {
						margin: 0
					}
				}
			);
			return;
		}
		const user = $activeUser?.accountName;

		let actions = [
			{
				account: MATS_CONTRACT,
				name: 'endmission',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user: $activeUser.accountName,
					mission_slot_id: slot.id
				}
			}
		];

		let trx = {
			actions
		};

		try {
			const result = await $activeUser.signTransaction(trx, {
				blocksBehind: 3,
				expireSeconds: 30,
				broadcast: true
			});
			$loading = true;
			$isDataLoading = true;
			open(AwaitingAuth);
			console.dir(result);

			pollForMissionResult(slot);
		} catch (err) {
			console.error(err);
			$loading = false;
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
	async function pollForMissionResult(slot) {
		await resolveAfterMS(2000);

		let slotData;

		while (true) {
			let res = await chain.post('/v1/chain/get_table_rows', {
				code: MATS_CONTRACT,
				scope: MATS_CONTRACT,
				table: 'missionslots',
				limit: 1,
				lower_bound: slot.id,
				upper_bound: slot.id,
				json: true
			});

			/* 			console.log('@ polling', res.rows[0]); */

			slotData = res.rows[0];

			if (slotData.outcomes.length > 0) {
				if (slotData.characters.length) {
					for (let index2 = 0; index2 < slotData.characters.length; index2++) {
						const char = slotData.characters[index2];
						const charData = await atomicAssetsApi.getAssetsById([char]);
						slotData.characterData = charData.data[0];
					}
				}

				break;
			}

			await resolveAfterMS(1500);
		}
		setTimeout(() => {
			window.reloadMissions(() => {
				$loading = false;
				$isDataLoading = false;
				close();
				open(
					MissionEnd,
					{ slotData, onClaim: handleClaimRewards },
					{
						styleContent: {
							padding: 0
						},
						styleWindow: {
							width: '760px'
						},
						styleWindowWrap: {
							margin: 0
						}
					}
				);
			});
		}, TRANSACTION_TIMEOUT_MS);
	}
	let video = true;
	let videoplayer;
	let videoplayer1;
	$: {
		if (!$loading && !$missionsActivated && video) {
			setTimeout(() => {
				videoplayer.play();
			}, 1000);
		}
	}
</script>

{#if screen == 'main'}
	<div
		class="container-box"
		class:blured={$inStats}
		in:fade={{ delay: 100, duration: 100 }}
		out:fade={{ delay: 100, duration: 100 }}
	>
		<div class="wrapper">
			{#if TESTNET}
				<div class="refresh">
					<div
						on:click={() => {
							$loading = true;
							window.reloadMissions(() => {
								$loading = false;
							});
						}}
						class="refreshIconWrap"
					>
						<img class="refreshIcon" src="/icons/refresh.svg" alt="" />
					</div>
				</div>
			{/if}
			{#if subPage == 'stats'}
				<div class="back-btn">
					<BackButton
						width="117px"
						text="BACK"
						onClick={() => {
							subPage = 'slots';
						}}
					/>
				</div>

				<div class="back-btn-mobile">
					<BackButtonMobile
						text="BACK"
						onClick={() => {
							subPage = 'slots';
						}}
					/>
				</div>
			{:else}
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
			{/if}
			<div class="main">
				{#if $missionsActivated && !$loading}
					<div class="left" class:middle={subPage == 'stats'}>
						<div><p class:hidden={subPage == 'stats'} class="left-title ">YOUR FORAGERS</p></div>
						<div class="selectedChar">
							{#if showStats}
								<div class="mint">
									#{mintNum}
								</div>
								<div class="level-wrapper" in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
									<div class="level">
										<LevelIcon
											{level}
											character_id={character?.asset_id}
											withProgress
											percent={(exp * 100) / expToLevel}
										/>
									</div>
								</div>
							{/if}

							{#if $allChars.length > 1}
								<Carousel
									bind:this={carousel}
									on:change={handleChange}
									bind:currentIndex={characterIndex}
									perPage={1}
									dots={false}
									loop={true}
								>
									<div slot="left-control" class="nav-btn flex center unselectable " style="">
										<img src="/icons/chevron-left.svg" alt="" />
									</div>

									<div slot="right-control" class="nav-btn flex center unselectable " style="">
										<img src="/icons/chevron-right.svg" alt="" />
									</div>

									{#each $allChars as item, index}
										<SplideSlide>
											<CharacterCard
												onClick={() => {
													subPage = 'stats';
												}}
												item={{ ...item }}
												asset_id={item?.asset_id}
												inStats={subPage == 'stats'}
											/>
										</SplideSlide>
									{/each}
								</Carousel>
							{:else if $allChars.length == 1}
								{#each $allChars as item, index}
									{#if item.asset_id}
										<CharacterCard
											onClick={() => {
												/* 				console.log('test'); */
												subPage = 'stats';
											}}
											{item}
											{index}
											asset_id={item?.asset_id}
											inStats={subPage == 'stats'}
										/>
									{/if}
								{/each}
							{:else}
								<div class="flex center">
									<div class="nochar flex center">
										<div class="cont">
											<h2>YOU DON'T HAVE ANY FORAGERS</h2>
											<p>
												Buy some from the <a href="/store">Shell Road</a> or the
												<a
													href="https://wax.atomichub.io/market?collection_name=greenrabbit"
													target="_blank">Secondary Market</a
												>
											</p>
										</div>
									</div>
								</div>
							{/if}
							{#if character}
								<div
									class="left-footer"
									on:click={() => {
										subPage = 'stats';
									}}
								>
									{#if showStats}
										<div in:slide={{ duration: 200 }} out:slide={{ duration: 100 }}>
											{#if subPage == 'slots'}
												<div
													in:fade={{ duration: 200 }}
													out:fade={{ duration: 100 }}
													class="left-footer-icon"
												>
													<div class="left-group-item">
														<div class="left-icon">
															<img src={Shape1} alt="Strength" class="" />
														</div>
														<div class="left-text">{strength}</div>
													</div>
													<div class="left-group-item">
														<div class="left-icon">
															<img src="/assets/mission/speed.svg" alt="Speed" class="" />
														</div>
														<div class="left-text">{speed}</div>
													</div>
													<div class="left-group-item">
														<div class="left-icon">
															<img src={Shape3} alt="Luck" class="" />
														</div>
														<div class="left-text">{luck}</div>
													</div>
												</div>
											{/if}
											<div class="left-group-text">
												<p class="text">{name}</p>
												<button class="btn">{character?.data.Rarity}</button>
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					<div class="right">
						{#if subPage == 'slots'}
							<div transition:slide>
								<p class="right-text">MISSIONS</p>
								<div class="right-grid">
									{#each Array(4) as _, index}
										{#if $missionSlots[index]}
											<Square
												mission={$missionSlots[index]}
												{handleEndMission}
												{handleRetryRng}
												{gotoMap}
											/>
										{:else}
											<SquareLock />
										{/if}
									{/each}
								</div>
							</div>
						{:else if subPage == 'stats'}
							<div transition:slide>
								<LevelCard
									{exp}
									{expToLevel}
									{level}
									{strength}
									{totalExp}
									{speed}
									{luck}
									{character}
									{hasStats}
									statPoints={attrib_pts}
								/>
							</div>
						{/if}
					</div>
				{:else if $loading}
					<div class="flex center" style="min-height:500px;width:100%;">
						<LoaderDots />
					</div>
				{:else}
					<div class="flex center relative" style="min-height:500px;width:100%;">
						<video
							bind:this={videoplayer}
							style="width: 100vw;position:absolute;"
							loop
							muted
							src={'/assets/mission/Loading_GR_Foraging_Idle_2.mp4'}
						/>
						<video
							bind:this={videoplayer1}
							class:hidden={video}
							style="width: 100vw;position:absolute;"
							on:ended={() => {
								{
									getStarted();
								}
							}}
							muted
							src={'/assets/mission/Foraging_Start_1_1.mp4'}
						/>
						{#if video}
							<div
								style="position: absolute;
							margin-left: 46%;"
							>
								<CtaButton
									outlined
									text="GET STARTED"
									onClick={() => {
										video = false;
										videoplayer1.currentTime = 0;
										videoplayer1.play();
									}}
								/>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else if (screen = 'map')}
	<div
		class="container"
		in:fade={{ delay: 100, duration: 100 }}
		out:fade={{ delay: 100, duration: 100 }}
	>
		<MissionMap bind:character {gotoMain} {startMission} />
	</div>
{/if}

<style>
	.cont h2 {
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 20px;
		line-height: 48px;

		align-items: center;
		text-align: center;

		color: #ffffff;

		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
	}
	.cont p a {
		color: var(--primary-teal);
	}
	.cont p {
		width: 239px;
		height: 48px;
		font-family: Lato;
		font-style: normal;
		font-weight: bold;
		font-size: 18px;
		line-height: 24px;
		text-align: center;
		color: #ffffff;
		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
		margin: 0 auto;
	}
	.nochar {
		width: 428px;
		height: 178px;
		margin-top: 127px;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 2px;
	}
	.relative {
		position: relative;
	}
	.selectedChar {
		width: 100%;
	}
	.blured {
		backdrop-filter: blur(8px);
	}
	.back-btn {
		width: 117px;
		margin-left: 124px;
	}
	.refresh {
		position: absolute;
		cursor: pointer;
	}

	.mint {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 4px 8px;

		position: absolute;
		margin-top: 18px;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 300px;
		margin-left: 142px;
	}
	.hidden {
		opacity: 0;
	}
	.middle {
		margin-top: 122px;
	}
	/* 	.disabled {
		opacity: 0;
		cursor: default !important;
	} */
	.level-wrapper {
		position: absolute;
	}
	.level {
		position: relative;
		left: 500px;
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
	.ctrl-wrap {
		position: absolute;
	}
	.controls {
		position: relative;
		top: 200px;
		z-index: 0;
		width: 486px;
		display: flex;
		justify-content: space-between;
	}
	.container-box {
		/* 		background-image: url('/assets/mission/bg.png');
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		background-color: rgba(0, 0, 0, 0.3);
		background-blend-mode: soft-light; */
		min-height: calc(100vh - 173px);
		transition: all 0.5s ease-in-out;
	}

	.wrapper {
		max-width: 1440px;
		color: white;
		width: 100%;
		height: auto;
		padding-bottom: 40px;
		margin: 0 auto;
		position: relative;
	}
	.menu {
		width: 50%;
		margin: 0 auto;
		padding-top: 20px;
		justify-content: space-between;
		display: flex;
		align-items: center;
	}
	.main {
		width: 100%;
		display: flex;
		margin-top: 50px;
	}
	.left {
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: all 1s ease-in-out;
	}
	.left-title {
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 24px;
		line-height: 48px;
		transition: all 1s ease-in-out;
		/* identical to box height, or 200% */
		display: flex;
		align-items: center;
		text-align: center;
		letter-spacing: 0.1em;
		min-height: 48px;
		color: #ffffff;

		text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.7);
	}
	/* 	.left-header {
		position: relative;
		width: 100%;
		height: 370px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.symbol {
		position: absolute;
		top: 10px;
		right: 150px;
		width: 70px;
	} */
	.left-footer {
		display: flex;
		height: 140px;
		flex-direction: column;
		margin-top: 25px;
		width: 100%;
		background-image: url('/assets/mission/bg_footer.png');
		position: relative;
	}
	.left-footer::after {
		position: absolute;
		content: '';
		width: 67%;
		height: 3px;
		left: 13%;
		background-repeat: no-repeat;
		background-size: contain;
		bottom: 0;
		background-image: url('/assets/mission/border_footer.png');
	}
	.left-footer-icon {
		display: flex;
		margin: 0 auto;
		width: 40%;
		position: relative;
		justify-content: space-around;
		align-items: center;
	}
	.left-group-item {
		display: flex;
		align-items: center;
	}
	.left-group-text {
		justify-content: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 15px;
	}

	.left-icon {
		display: flex;
	}
	.left-text {
		padding-left: 5px;
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 18px;
		line-height: 20px;
	}

	.btn {
		border: 1px solid #fff;
		outline: none;
		color: white;
		background-color: black;
		padding: 5px 30px;
		border-radius: 15px;
		margin-top: 7px;
	}

	.menu-item {
		width: 20%;
		justify-content: space-around;
		display: flex;
		align-items: center;
	}

	.menu-item span {
		width: 80px;
		height: 30px;
		line-height: 30px;
		background-color: black;
		color: #fff;
		font-weight: bold;
		text-align: center;
		border-radius: 2px;
		border: #f0eded17 solid 0.5px;
	}

	.right {
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.right-grid {
		display: grid;
		grid-template-columns: 45% 45%;
		grid-gap: 30px;
	}
	.right-text {
		width: 100%;
		text-align: center;
		font-weight: bold;
		font-size: 24px;
		padding-bottom: 40px;
	}
	.text {
		font-size: 24px;
		font-weight: bold;
	}

	.back-btn-mobile {
		display: none;
	}

	@media (max-width: 768px) {
		.container-box {
		}
		.mint {
			margin-top: 45px;

			margin-left: 55px;
		}
		.main {
			flex-direction: column;
			gap: 30px;
		}
		.level {
			left: 69vw;
			z-index: 1;
			top: 35px;
		}
		.ctrl-wrap {
			display: none;
		}
		.left-title {
			margin-bottom: 40px;
		}
		.left {
			width: 100%;
		}
		.left-footer::after {
			width: 75%;
		}
		.right {
			width: 100%;
			padding-top: 50px;
		}
		/* 		.arrow {
			display: none;
		}
		.symbol {
			right: 20px;
		} */
		.menu {
			width: 100%;
			overflow: hidden;
		}
		.menu-item {
			flex-direction: column;
		}
		.menu-img {
			height: 50px;
			margin-bottom: 10px;
		}
		.right-grid {
			width: 100%;
			display: flex;
			overflow-x: scroll;
			padding: 0 20px;
			max-width: 100vw;
		}
		.right-grid::-webkit-scrollbar {
			display: none;
		}
		.left-footer-icon {
			width: 65%;
		}

		.back-btn {
			width: 212px;
			margin-left: 10px;
		}

		.middle {
			margin-top: 0px;
		}

		.back-btn {
			display: none;
		}

		.back-btn-mobile {
			display: block;
			padding-left: 10px;
			padding-top: 10px;
		}
		.selectedChar {
			width: 100vw;
		}
	}
</style>
