<script>
	import { loading } from 'src/stores/missionStores';

	import { activeUser, isDataLoading, now } from 'src/stores/store';

	import { IPFS_URL_ONE, MATS_CONTRACT, TOKEN_CONTRACT } from 'src/utils/config';
	import { hoursDiff } from 'src/utils/helpers';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import MissionTimer from '../MissionTimer.svelte';
	import { getContext } from 'svelte';
	import HealForager from '../greenprint/overlays/HealForager.svelte';

	const { open, close } = getContext('simple-modal');
	export let onClick;
	export let item;
	export let asset_id;
	export let inStats;

	$: foragerReturned = item?.onMission ? item.missionStart + item.missionDuration <= $now : false;
	$: foragerOnCd = item?.data?.Cooldown ? item.data.Cooldown > $now : false;
	$: cooldown = item?.data?.Cooldown;
	var dragging;
	dragging = false;

	function handleMousedown(event) {
		dragging = false;
	}

	function handleMousemove(event) {
		dragging = true;
	}

	let claimclicked = false;
	function handleMouseup(event) {
		var wasDragging;
		wasDragging = dragging;
		dragging = false;
		if (!wasDragging) {
			setTimeout(function () {
				if (healclicked) buyoutCharacterRecoveryModal();
				else if (claimclicked) claimLevelUp(item.asset_id);
				else onClick();
				healclicked = false;
				claimclicked = false;
			}, 10);
		}
	}
	async function claimLevelUp(asset_id) {
		const user = $activeUser.accountName;

		const actions = [
			{
				account: MATS_CONTRACT,
				name: 'claimlvlup',
				authorization: [
					{
						actor: user,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					user,
					forager_id: asset_id
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

			console.dir(result);
			$isDataLoading = true;
			$loading = true;
			/* closeClaimLvlModal(); */
			close();
			open(AwaitingAuth);
			setTimeout(() => {
				window.reloadMissions(() => {
					$isDataLoading = false;
					$loading = false;
					close();
				});
			}, 4000);
		} catch (err) {
			console.error(err);
			$loading = false;
			close();
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}

	let healclicked = false;
	async function buyoutCharacterRecovery() {
		const user = $activeUser?.accountName;

		let cooldown = Number(item.data.Cooldown);
		const level = Number(item?.data?.Level ?? 1);

		const base_strength = Number(item?.data['Base Strength']);
		const extra_strength = Number(item?.data?.Strength ?? 0);
		const strength = base_strength + extra_strength;

		const min_cost = 10000;
		const hours_left = hoursDiff(cooldown, $now);
		const hourly_cost = Math.max(4000 * level - 3000 * strength, min_cost);
		const revive_cost = hourly_cost * hours_left;

		let actions = [
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
					from: user,
					to: MATS_CONTRACT,
					quantity: `${revive_cost.toFixed(4)} SHELL`,
					memo: `forager revive|${item.asset_id}`
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
			open(AwaitingAuth);
			$loading = true;
			console.dir(result);

			setTimeout(() => {
				window.reloadMissions();
				window.refreshBalance();
				close();
			}, 4000);
		} catch (err) {
			console.error(err);
			close();
			$loading = false;
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
	async function buyoutCharacterRecoveryModal() {
		let cooldown = Number(item.data.Cooldown);

		const level = Number(item?.data?.Level ?? 1);

		const base_strength = Number(item?.data['Base Strength']);
		const extra_strength = Number(item?.data?.Strength ?? 0);
		const strength = base_strength + extra_strength;

		const min_cost = 10000;
		const hours_left = hoursDiff(cooldown, $now);
		const hourly_cost = Math.max(4000 * level - 3000 * strength, min_cost);
		const revive_cost = hourly_cost * hours_left;

		open(HealForager, { amount: revive_cost, onPay: buyoutCharacterRecovery }, stylingResetCD);
	}
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
</script>

{#if item.asset_id}
	<div
		class="left-header"
		on:mousedown={handleMousedown}
		on:mousemove={handleMousemove}
		on:mouseup={handleMouseup}
	>
		<img
			src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/unframed/{item
				.data.img}.png"
			class="d-block w-100 char"
			alt={`${item.data.name} - ${asset_id}`}
		/>

		<img
			class="img-bot"
			class:hidden={!inStats}
			src="/assets/mission/charBottom.png"
			style=""
			alt=""
		/>

		{#if foragerOnCd}
			<div class="onMissionInj">
				<div class="timer-wrap">
					<div class="lft">
						<svg
							width="29"
							height="29"
							viewBox="0 0 29 29"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								cx="14.5"
								cy="14.5"
								r="13.5"
								fill="#111111"
								stroke="#F83C69"
								stroke-width="2"
							/>
							<rect x="12" y="8" width="5" height="13" fill="#F83C69" />
							<rect
								x="21"
								y="12"
								width="5"
								height="13"
								transform="rotate(90 21 12)"
								fill="#F83C69"
							/>
						</svg>
					</div>
					<div class="rt">
						<span class="injury-label">{'INJURED'}</span>
						<span class="injury-countdown"><MissionTimer start={cooldown} /></span>
					</div>
				</div>

				<span class="heal" on:click={() => (healclicked = true)}>INSTANTLY HEAL</span>
			</div>
		{/if}
		{#if item.onMission && item.missionStart && item.missionDuration}
			<div class="onMission">
				<span class="mission-label">{foragerReturned ? 'FORAGER RETURNED' : 'ON A MISSION'}</span>
				<span class="mission-countdown"
					><MissionTimer start={item.missionStart + item.missionDuration} /></span
				>
			</div>
		{/if}
		{#if item.unclaimed}
			<div class="onMission">
				<div class="mission-label">
					<span class="mission-label">{'Leveled Up'}</span>
				</div>

				<span class="heal" style="margin-top:0" on:click={() => (claimclicked = true)}>CLAIM</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.hidden {
		opacity: 0;
	}
	.img-bot {
		position: absolute;
		max-width: 579px;
		bottom: 0;
		z-index: -1;
		transition: all 0.5s ease-in-out;
	}
	.heal {
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 16px;
		line-height: 19px;
		display: flex;
		align-items: center;
		text-align: center;
		text-transform: uppercase;

		color: #36ffc0;
		cursor: pointer;
		margin-top: 20px;
	}
	.heal:hover {
		color: #ffffff;
	}
	.rt {
		margin-left: 8px;
	}
	.injury-countdown {
		font-family: Lato;
		font-style: normal;
		font-weight: normal;
		font-size: 16px;
		line-height: 19px;
		display: flex;
		align-items: center;

		color: #ffffff;

		opacity: 0.8;
	}
	.injury-label {
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 16px;
		line-height: 19px;
		display: flex;
		align-items: center;
		text-align: center;
		letter-spacing: 0.1em;
		text-transform: uppercase;

		color: #f83c69;
	}
	.mission-countdown {
		font-family: Lato;
		font-style: normal;
		font-weight: normal;
		font-size: 16px;
		line-height: 19px;
		display: flex;
		align-items: center;

		color: #ffffff;

		opacity: 0.8;
	}
	.mission-label {
		font-family: Lato;
		font-style: normal;
		font-weight: 900;
		font-size: 16px;
		line-height: 19px;
		display: flex;
		align-items: center;
		text-align: center;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		margin-bottom: 5px;
	}
	.onMissionInj {
		display: flex;
		flex-direction: column;
		position: absolute;
		justify-content: center;
		align-items: center;
		width: 287px;
		height: 115px;
		background: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0) 0%,
			rgba(0, 0, 0, 0.8) 17.19%,
			rgba(0, 0, 0, 0.8) 82.29%,
			rgba(0, 0, 0, 0) 100%
		);
		border: 1px solid #000000;
		border-top: 1px solid white;
		border-bottom: 1px solid white;
		box-sizing: border-box;
		filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
	}
	.timer-wrap {
		display: flex;
		flex-direction: row;
	}
	.onMission {
		display: flex;
		flex-direction: column;
		position: absolute;
		justify-content: center;
		align-items: center;
		width: 287px;
		height: 69px;
		background: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0) 0%,
			rgba(0, 0, 0, 0.8) 17.19%,
			rgba(0, 0, 0, 0.8) 82.29%,
			rgba(0, 0, 0, 0) 100%
		);
		border: 1px solid #000000;
		border-top: 1px solid white;
		border-bottom: 1px solid white;
		box-sizing: border-box;
		filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
	}
	.left-header {
		position: relative;
		width: 100%;
		height: 370px;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}
	.char {
		height: 100%;
		margin-bottom: 20px;
	}
	.char:hover {
		-webkit-filter: brightness(1.5);
		filter: brightness(1.5);
	}
	@media (max-width: 768px) {
		.img-bot {
			max-width: 358px;
		}
	}
</style>
