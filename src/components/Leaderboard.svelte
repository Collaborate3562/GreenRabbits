<script>
	import { fly, slide } from 'svelte/transition';

	import FilterDropdown from './FilterDropdown.svelte';
	import LeaderboardTable from './LeaderboardTable.svelte';

	let currentTab = 'fail';
	let available;
	let staked;
	let data = [];
	let overallData = [];
	/* 	let typeFilter = [
		{ name: 'Last 24 hours', id: 1, matcher: 'day' },
		{ name: 'Last 7 days', id: 2, matcher: 'week' },
		{ name: 'Current week', id: 3, matcher: 'current week' },
		{ name: 'Previous week', id: 3, matcher: 'previous week' },
		{ name: 'Current month', id: 3, matcher: 'current month' },
		{ name: 'Previous month', id: 3, matcher: 'previous month' },
		{ name: 'Last 30 days', id: 4, matcher: 'month' }
	]; */
	let typeFilter = [
		{ name: 'Current week', id: 3, matcher: 'current week' },
		{ name: 'Previous week', id: 3, matcher: 'previous week' },
		{ name: 'Current month', id: 3, matcher: 'current month' },
		{ name: 'Previous month', id: 3, matcher: 'previous month' },
		{ name: 'All time', id: 3, matcher: 'alltime' }
	];

	let selectedType;
	let x = 200;
	const lastUpdate = async () => {
		const res = await fetch(`https://api.greenrabbitgame.io/v1/crafting/last-sync`);

		const data = await res.json();

		const date = new Date(data.lastSync * 1000);
		updatedAt = date;
	};

	let masterTab = 'crafting';
	let updatedAt = null;
	const getData = async (
		craft_type,
		timeframe,
		outcome,
		overall = false,
		category = 'crafting'
	) => {
		if (category == 'boost' && !overall)

			var endpoint = `https://api.greenrabbitgame.io/v1/${category}/leaderboard?rarity=${rarity}&totem=${totem}${
				timeframe != 'alltime' ? '&timeframe=' + timeframe : ''
			}&outcome=common`;
		if (category == 'boost' && overall)
			var endpoint = `https://api.greenrabbitgame.io/v1/${category}/leaderboard?timeframe=${timeframe}&outcome=common`;
		else if (category == 'gpfusion' && !overall)
			var endpoint = `https://api.greenrabbitgame.io/v1/fusion/leaderboard?rarity=${rarity}${
				timeframe != 'alltime' ? '&timeframe=' + timeframe : ''
			}&outcome=${outcome}&fusion_type=Greenprint`;
		else if (category == 'gpfusion' && overall)
			var endpoint = `https://api.greenrabbitgame.io/v1/fusion/leaderboard?outcome=${outcome}&fusion_type=Greenprint${
				timeframe != 'alltime' ? '&timeframe=' + timeframe : ''
			}`;
		else if (category == 'orbfusion' && !overall)
			var endpoint = `https://api.greenrabbitgame.io/v1/fusion/leaderboard?rarity=${rarity}&outcome=${outcome}${
				timeframe != 'alltime' ? '&timeframe=' + timeframe : ''
			}&fusion_type=Orb`;
		else if (category == 'orbfusion' && overall)
			var endpoint = `https://api.greenrabbitgame.io/v1/fusion/leaderboard?fusion_type=Orb${
				timeframe != 'alltime' ? '&timeframe=' + timeframe : ''
			}`;
		else if (category == 'crafting')
			var endpoint = `https://api.greenrabbitgame.io/v1/${category}/leaderboard?craft_type=${craft_type}${
				timeframe != 'alltime' ? '&timeframe=' + timeframe : ''
			}&outcome=${outcome}`;

		const res = await fetch(endpoint);
		const resData = await res.json();

		if (resData) {
			if (overall) overallData = resData;
			else data = resData;
		} else {
			if (overall) overallData = [];
			else data = [];
		}
	};
	let craft_types = {
		'4 comp': '4-Component',
		'3d common': '3D Common',
		'3d uncommon': '3D Uncommon',
		'3d epic': '3D Epic',
		'3d legendary': '3D Legendary',
		'3d mythic': '3D Mythic'
	};
	let activeCat = '4 comp';
	let fusion_types = ['Greenprint', 'Orb'];
	let fusion_type = 'Greenprint';
	let rarities = ['Common', 'Uncommon', 'Epic', 'Legendary', 'Mythic'];
	let rarity = 'Common';
	let totems = ['Cat', 'Snake', 'Turtle', 'Rabbit'];
	let totem = 'Cat';
	$: {
		if (activeCat && selectedType && masterTab && rarity && fusion_type) {
			lastUpdate();
			getData(craft_types[activeCat], selectedType.matcher, currentTab, false, masterTab);
			getData('', selectedType.matcher, currentTab, true, masterTab);
		}
	}
	let innerWidth;
	function setMasterTab(tab) {
		if (tab != masterTab) {
			masterTab = tab;
		}
	}
</script>

<svelte:window bind:innerWidth />
<div class="wrapper">
	<div class="header">
		<div class="header-column">
			<img src="/assets/leaderboard/banner.png" alt="Leaderboard visualization" />
			<h1>Leaderboard</h1>
			{#if updatedAt}
				<p style="margin-bottom:10px;">Last update: {updatedAt}</p>
			{/if}

			<div class="filter-wrap">
				<FilterDropdown width="190px" bind:selected={selectedType} filterItems={typeFilter} />
			</div>
		</div>
	</div>
	<div class="leaderboard-bg">
		<div class="btn-wrap">
			<div class="buttons">
				<div
					class="tab-btn"
					on:click={() => {
						setMasterTab('crafting');
					}}
					class:active-btn={masterTab == 'crafting'}
				>
					GREENPRINT CRAFTING
				</div>
				<div
					class="tab-btn"
					on:click={() => {
						setMasterTab('gpfusion');
					}}
					class:active-btn={masterTab == 'gpfusion'}
				>
					GREENPRINT FUSION
				</div>
				<div
					class="tab-btn"
					on:click={() => {
						setMasterTab('orbfusion');
					}}
					class:active-btn={masterTab == 'orbfusion'}
				>
					ORB FUSION
				</div>
				<!-- 		<div
					class="tab-btn"
					on:click={() => {
						setMasterTab('boost');
					}}
					class:active-btn={masterTab == 'boost'}
				>
					GREENPRINT BOOSTING
				</div> -->
			</div>
		</div>

		{#if masterTab == 'crafting'}
			<div class="tab">
				<div class="tab-wrap">
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'fail'}
							on:click={() => {
								x = 200;
								currentTab = 'fail';
							}}>FAILED GP CRAFTS</button
						>
					</div>
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'success'}
							on:click={() => {
								x = -200;
								currentTab = 'success';
							}}>SUCCESSFUL GP CRAFTS</button
						>
					</div>
					{#if innerWidth > 1390}
						<div
							style="position: relative;display:flex;justify-content:center;transition:all 0.2s;  right: {currentTab ===
							'fail'
								? '487'
								: '185'}px; top: 39px;"
						>
							<div style="background:var(--primary-teal);width:76px;height:6px;" />
						</div>
					{/if}
				</div>
			</div>
			{#if data && overallData}{#if currentTab === 'fail'}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							{data}
							view="category"
						/>
					</div>
				{:else}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} type="success" />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							{data}
							view="category"
							type="success"
						/>
					</div>
				{/if}{/if}
		{:else if masterTab == 'orbfusion'}

			<div class="tab">

				<div class="tab-wrap">
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'fail'}
							on:click={() => {

								x = 200;
								currentTab = 'fail';
							}}>FAILED ORB FUSIONS</button
						>
					</div>
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'success'}
							on:click={() => {
								x = -200;
								currentTab = 'success';
							}}>SUCCESSFUL ORB FUSIONS</button

						>
					</div>
					{#if innerWidth > 1390}
						<div
							style="position: relative;display:flex;justify-content:center;transition:all 0.2s;  right: {currentTab ===
							'fail'
								? '487'
								: '185'}px; top: 39px;"
						>
							<div style="background:var(--primary-teal);width:76px;height:6px;" />
						</div>
					{/if}
				</div>

			</div>

			{#if data && overallData}{#if currentTab === 'fail'}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							bind:fusion_type
							{data}
							view="category"
						/>
					</div>
				{:else}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} type="success" />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							bind:fusion_type
							{data}
							view="category"
							type="success"
						/>
					</div>
				{/if}{/if}
		{:else if masterTab == 'gpfusion'}
			<div class="tab">
				<div class="tab-wrap">
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'fail'}
							on:click={() => {
								x = 200;
								currentTab = 'fail';
							}}>FAILED FUSIONS</button
						>
					</div>
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'success'}
							on:click={() => {
								x = -200;
								currentTab = 'success';
							}}>SUCCESSFUL FUSIONS</button
						>
					</div>
					{#if innerWidth > 1390}
						<div
							style="position: relative;display:flex;justify-content:center;transition:all 0.2s;  right: {currentTab ===
							'fail'
								? '487'
								: '185'}px; top: 39px;"
						>
							<div style="background:var(--primary-teal);width:76px;height:6px;" />
						</div>
					{/if}
				</div>
			</div>
			{#if data && overallData}{#if currentTab === 'fail'}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							bind:fusion_type
							{data}
							view="category"
						/>
					</div>
				{:else}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} type="success" />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							bind:fusion_type
							{data}
							view="category"
							type="success"
						/>
					</div>
				{/if}{/if}
		{:else if masterTab == 'boost'}
			<div class="tab">
				<div class="tab-wrap">
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'fail'}
							on:click={() => {
								x = 200;
								currentTab = 'fail';
							}}>FAILED GP BOOSTS</button
						>
					</div>
					<div class="button-wrap">
						<button
							class="tablinks"
							class:selected={currentTab === 'success'}
							on:click={() => {
								x = -200;
								currentTab = 'success';
							}}>SUCCESSFUL GP BOOSTS</button
						>
					</div>
					{#if innerWidth > 1390}
						<div
							style="position: relative;display:flex;justify-content:center;transition:all 0.2s;  right: {currentTab ===
							'fail'
								? '487'
								: '185'}px; top: 39px;"
						>
							<div style="background:var(--primary-teal);width:76px;height:6px;" />
						</div>
					{/if}
				</div>
			</div>
			{#if data && overallData}{#if currentTab === 'fail'}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							{data}
							view="category"
						/>
					</div>
				{:else}
					<div
						class="table-wrapper"
						in:fly={{ x: -x, delay: 200, duration: 190 }}
						out:fly={{ x, duration: 190 }}
					>
						<LeaderboardTable bind:masterTab data={overallData} type="success" />
						<LeaderboardTable
							bind:masterTab
							bind:activeCat
							bind:rarity
							bind:totem
							{data}
							view="category"
							type="success"
						/>
					</div>
				{/if}{/if}
		{/if}
	</div>
</div>

<style>
	.buttons {
		display: flex;
		margin: 0 auto;
		justify-content: center;
		margin-bottom: 74px;
		margin-top: 54px;
	}
	.btn-wrap {
		width: 100%;
	}
	.tab-btn {
		margin-left: 5px;
		margin-right: 5px;
		width: 239px;

		height: 55px;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		border: solid 2px #fff;
		border-bottom: solid 6px #fff;
		background-color: #161616;
		color: white;
		cursor: pointer;
	}
	.tab-btn:hover {
		background-color: #2b2b2b;
	}
	.active-btn {
		border: solid 2px #36ffc0;
		border-bottom: solid 6px #36ffc0;
	}
	.leaderboard-bg {
		border: solid 1px #3c3c3c;

		background-image: linear-gradient(to bottom, #171717, #0f0f0f);
	}
	.wrapper {
		margin-bottom: 100px;
	}
	.table-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-top: 104px;
	}
	.button-wrap {
		display: flex;
		flex-direction: column;
	}
	.filter-wrap {
		display: flex;
		justify-content: center;
	}
	.header-column {
		display: flex;
		flex-direction: column;
		margin-bottom: 48px;
	}
	.no__items {
		max-height: 920px;
		min-height: 920px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.header {
		color: var(--pure-white);
		margin: -46px auto 28px;
		padding: 0 18px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-width: 421px;
		position: relative;
	}
	.back-btn {
		position: absolute;
		top: 16px;
		left: 0;
	}

	.header h1 {
		font-size: 36px;
		text-align: center;
		font-weight: 900;
		margin-bottom: 28px;
	}

	.header .promo-info {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.header .promo-info div {
		flex-direction: column;
		display: flex;
		direction: rtl;
		justify-content: space-between;
	}

	.generating {
		flex: 0 0 115px;
	}
	.available {
		flex: 0 0 93px;
	}

	.header .info {
		color: var(--primary-teal);
	}
	.grid {
		position: relative;
		padding: 0 20px 40px;
		justify-items: center;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		max-height: 920px;
		min-height: 920px;
		overflow-y: auto;
	}

	.tab button {
		/* REMOVE DEFAULT STYLE */
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;

		/* NEW STYLE */
		font-size: 18px;

		color: white;
		font-size: 17px;
		text-transform: uppercase;
		min-width: 149px;
	}

	div > button.selected {
		font-weight: 900;
		/* border-bottom: 5px solid var(--primary-teal); */
	}
	.tab {
		display: flex;
		justify-content: space-evenly;
		margin: 0 0;
		border-bottom: solid 1px #707070;
		margin-bottom: 32px;
	}
	.tab-wrap {
		width: 375px;
		display: flex;
		justify-content: space-evenly;
		min-height: 45px;
	}

	.tabcontent {
		display: none;
		color: white;
		overflow: hidden;
		max-width: 1100px;
		max-height: 920px;
		margin: 0 auto 32px;
		padding: 20px 0 0;
		border: 1px solid var(--primary-teal);
	}
	.tabcontent.selected {
		display: block;
	}

	@media (min-width: 575px) {
		.grid {
			grid-template-columns: 1fr 1fr 1fr;
		}

		.tabcontent {
			padding: 20px;
		}
	}
	@media (min-width: 768px) {
		.tab-wrap {
			max-width: 600px;
		}
		.grid {
			grid-template-columns: 1fr 1fr 1fr 1fr;
		}

		.header {
			max-width: none;
			flex-direction: row;
		}
		.header h1 {
			font-size: 46px;
			text-align: center;
		}

		.back-btn {
			top: 0;
			bottom: 105px;
			top: auto;
		}
	}

	@media (min-width: 1024px) {
		.header {
			max-width: 1100px;
			padding: 0;
		}
		.promo-info {
			flex: 0 1 500px;
		}
		.promo-info div {
			height: 55px;
			flex: 1 0 auto;
		}
	}
	@media (min-width: 1390px) {
		.table-wrapper {
			display: flex;
			flex-direction: row;
			justify-content: center;
			margin-top: 104px;
		}
		.tab button {
			/* REMOVE DEFAULT STYLE */

			min-width: 300px;
		}
	}
</style>
