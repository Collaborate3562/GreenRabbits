<script>
	import { activeUser } from 'src/stores/store';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';

	import { fade, fly, slide } from 'svelte/transition';

	export let type = 'failed';
	export let view = 'overall';
	export let masterTab;
	export let data;
	export let rarity;
	export let totem;
	let rarities = ['Common', 'Uncommon', 'Epic', 'Legendary', 'Mythic'];
	let fusion_rarities = ['Common', 'Uncommon', 'Epic', 'Legendary'];
	let fusion_types = ['Greenprint', 'Orb'];
	export let fusion_type = 'Greenprint';
	let totems = ['Cat', 'Snake', 'Turtle', 'Rabbit'];
	let categories = ['4 comp', '3d common', '3d uncommon', '3d epic', '3d legendary', '3d mythic'];
	export let activeCat = '4 comp';
	let userPos;

	$: userInTop100 = data.slice(0, 20).filter((e) => e.User == $activeUser.accountName).length > 0;
	$: {
		userPos = false;
		data.forEach((element) => {
			if (element.User == $activeUser.accountName) {
				userPos = element;
			}
		});
	}
	let src = '';
	$: {
		if (type == 'failed') {
			if (view == 'overall') {
				src = '/assets/leaderboard/fail-overall.png';
			} else {
				src = '/assets/leaderboard/fail.png';
			}
		} else {
			if (view == 'overall') {
				src = '/assets/leaderboard/success-overall.png';
			} else {
				src = '/assets/leaderboard/success.png';
			}
		}
	}
	function parseTotalCost(totalCost) {
		return (
			toFixedCurrency(totalCost.split(' ')[0].split('.')[0]) +
			'.' +
			totalCost.split(' ')[0].split('.')[1] +
			' SHELL'
		);
	}
</script>

<div class="table" class:table1={view === 'overall'} class:table2={view !== 'overall'}>
	<img in:fly={{ duration: 200, delay: 400 }} class="gp-image" {src} alt="" />
	{#if view === 'overall'}
		<h1 in:slide>OVERALL</h1>
		<div in:slide class="divider" />
		<div in:slide class="table-content">
			{#each data.slice(0, 20) as user, i}
				<div
					class="table-row"
					class:self={$activeUser.accountName == user.User}
					in:fade={{ duration: 200, delay: 10 * i + 2 }}
					class:big-row={i < 3}
					class:else-row={i >= 3}
				>
					<div class="table-cell">
						{#if i < 3}
							<img class="position" src="/assets/leaderboard/{i + 1}.png" alt="" />{:else}
							<span>{i + 1}.</span>
						{/if}
					</div>
					<div class="table-cell table-overall">
						<span
							>{user.User}
							{$activeUser.accountName == user.User ? '(you)' : ''}
							<span class="total-cost">{parseTotalCost(user.TotalCost)}</span></span
						>
					</div>

					{#if masterTab == 'crafting'}
						<div class="table-cell"><span>{user.Crafts}</span></div>
					{:else if masterTab == 'boost'}

						<div class="table-cell"><span>{user.Boosts} </span></div>

					{:else}
						<div class="table-cell"><span>{user.Fusions}</span></div>{/if}
				</div>
			{/each}{#if !userInTop100 && userPos}
				<div class="table-row else-row self" style="border-top:1px solid white">
					<div class="table-cell">
						<span>{userPos.Position}.</span>
					</div>
					<div class="table-cell table-overall">
						<span
							>{userPos.User} (you)
							<span class="total-cost">{parseTotalCost(userPos.TotalCost)}</span></span
						>
					</div>
					{#if masterTab == 'crafting'}

						<div class="table-cell"><span>{userPos.Crafts} </span></div>

					{:else if masterTab == 'boost'}
						<div class="table-cell"><span>{userPos.Boosts}</span></div>
					{:else}
						<div class="table-cell"><span>{userPos.Fusions}</span></div>{/if}
				</div>
			{/if}
		</div>
	{:else}
		<h1 in:slide>BY CATEGORY</h1>
		<div in:slide class="divider-cat" />
		<div class="category-wrapper">
			{#if masterTab == 'crafting'}
				{#each categories as cat}
					<span
						class="category"
						class:active={cat === activeCat}
						on:click={() => {
							activeCat = cat;
						}}>{cat.toUpperCase()}</span
					>
				{/each}
			{:else if masterTab == 'boost'}
				{#each rarities as rar}
					<span
						class="category"
						class:active={rar === rarity}
						on:click={() => {
							rarity = rar;
						}}>{rar.toUpperCase()}</span
					>
				{/each}
			{:else if masterTab == 'orbfusion'}
				{#each fusion_rarities as rar}
					<span
						class="category"
						class:active={rar === rarity}
						on:click={() => {
							rarity = rar;
						}}>{rar.toUpperCase()}</span
					>
				{/each}
			{:else if masterTab == 'gpfusion'}
				{#each rarities as rar}
					<span
						class="category"
						class:active={rar === rarity}
						on:click={() => {
							rarity = rar;
						}}>{rar.toUpperCase()}</span
					>
				{/each}
			{/if}
		</div>

		<div class="table-content">
			{#if data.length}
				{#each data.slice(0, 20) as user, i}
					<div
						class="table-row"
						in:fly={{ duration: 200, delay: 10 * i + 2 }}
						class:big-row={i < 3}
						class:else-row={i >= 3}
						class:self={$activeUser.accountName == user.User}
					>
						<div class="table-cell">
							{#if i < 3}
								<img class="position" src="/assets/leaderboard/{i + 1}.png" alt="" />{:else}
								<span>{i + 1}.</span>
							{/if}
						</div>
						<div class="table-cell table-cat">
							<span
								>{user.User}
								{$activeUser.accountName == user.User ? '(you)' : ''}
								<span class="total-cost">{parseTotalCost(user.TotalCost)}</span></span
							>
						</div>

						{#if masterTab == 'crafting'}
							<div class="table-cell"><span>{user.Crafts}</span></div>
						{:else if masterTab == 'boost'}
							<div class="table-cell"><span>{user.Boosts}</span></div>
						{:else}
							<div class="table-cell"><span>{user.Fusions}</span></div>{/if}
					</div>
				{/each}{#if !userInTop100 && userPos}
					<div class="table-row  else-row self" style="border-top:1px solid white">
						<div class="table-cell">
							<span>{userPos.Position}.</span>
						</div>
						<div class="table-cell table-cat" style="min-width:444px;justify-content: left;">
							<span
								>{userPos.User} (you)
								<span class="total-cost">{parseTotalCost(userPos.TotalCost)}</span></span
							>
						</div>

						{#if masterTab == 'crafting'}
							<div class="table-cell"><span>{userPos.Crafts}</span></div>
						{:else if masterTab == 'boost'}
							<div class="table-cell"><span>{userPos.Boosts}</span></div>
						{:else}
							<div class="table-cell"><span>{userPos.Fusions}</span></div>{/if}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.total-cost {
		font-size: 16px !important;

		font-weight: normal !important;

		text-align: left;

		color: #c9c9c9;
		margin-left: 14px;
	}
	.category-wrapper {
		display: flex;
		justify-content: space-evenly;
		width: 100%;
	}
	.table1 {
		width: 100vw;
	}
	.table2 {
		width: 100vw;
	}
	.self {
		color: #36ffc0 !important;
	}
	.category {
		color: white;
		min-width: calc(90% / 6);
		font-size: 13px;
		display: inline-block;
		height: 56px;
		vertical-align: middle;
		text-align: center;
		cursor: pointer;
	}
	.active {
		border-bottom: 6px solid var(--primary-teal);
	}
	.else-row {
		min-height: 60px;
		background-color: #3e3e3e;
	}
	.else-row:nth-child(even) {
		background-color: #3e3e3e;
	}
	.else-row:nth-child(odd) {
		background-color: transparent;
	}
	.table-cell {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 105px;
	}
	.position {
	}
	.big-row {
		min-height: 100px;
		border-bottom: solid 1px rgba(112, 112, 112, 0.5);
	}
	.big-row:last-child {
		border-bottom: 0;
	}
	.table-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		color: white;
	}
	.table-row span {
		font-size: 18px;

		font-weight: normal;

		font-stretch: normal;

		font-style: normal;

		line-height: normal;

		letter-spacing: normal;

		text-align: center;
	}
	.table-content {
		width: 100%;
		border-top: solid 1px #707070;
		display: flex;
		flex-direction: column;
	}
	.divider {
		width: 44px;
		margin: 0 auto;
		margin-top: 21px;
		margin-bottom: 78px;

		height: 3px;
		background: var(--primary-teal);
	}
	.divider-cat {
		width: 44px;
		margin: 0 auto;
		margin-top: 21px;
		margin-bottom: 42px;

		height: 3px;
		background: var(--primary-teal);
	}
	h1 {
		margin-top: 7px;
		font-size: 20px;

		font-weight: 900;

		font-stretch: normal;

		font-style: normal;

		line-height: normal;

		letter-spacing: 1px;

		text-align: center;

		color: #fff;
	}
	.gp-image {
		max-width: 146px;
		object-fit: scale-down;
		margin: 0 auto;
		min-height: 146px;
		margin-top: -50px;
	}
	.table {
		min-height: 1000px;

		margin: 0 26px 0 0;

		border-radius: 3px;

		box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.43);

		border: solid 1px #3c3c3c;

		background-color: #222;
		margin: 32px auto;
	}
	.table-cat {
		width: 100vw;
		justify-content: left;
	}
	.table-overall {
		width: 100vw;
		justify-content: left;
	}

	@media (min-width: 1390px) {
		.table {
			margin: 0 26px 0 0;
		}
		.table-cat {
			min-width: 444px;
		}
		.table-overall {
			min-width: 344px;
		}
		.table1 {
			width: 577px;
		}
		.table2 {
			width: 732px;
		}
		.category {
			font-size: 15px;
			height: 36px;
		}
	}
</style>
