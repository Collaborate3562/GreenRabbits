<script>
	import StakingInventory from 'components/staking/StakingInventory.svelte';
	import FilterModal from 'components/FilterModal.svelte';
	import StakedInventory from 'components/staking/StakedInventory.svelte';
	import StakeInfo from 'components/staking/StakeInfo.svelte';
	import BackButton from './BackButton.svelte';
	import { fade, slide } from 'svelte/transition';
	import { activeUser, assetsStore, lastPage, scrollToID } from 'src/stores/store';
	import AwaitingAuth from '../flashdrive/AwaitingAuth.svelte';
	import { onMount } from 'svelte';
	export let partner;
	let currentTab = 'Staked';
	function openTab(evt, tabName) {
		currentTab = tabName;
	}

	export let drive;
</script>

<div class="wrapper">
	<div class="header">
		{#if $lastPage == '/inventory'}
			<BackButton text="INVENTORY" link="/inventory" />
		{:else if $lastPage == '/greenprints'}
			<BackButton text="CRAFTING" link="/greenprints" />
		{:else}
			<BackButton text="ALL FLASHDRIVES" {partner} />{/if}
		<img
			alt="ShellOS"
			src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/v1628668382/GreenRabbit/shellos.png"
		/>
	</div>
	<div class="desktop">
		<FilterModal />
		<div in:fade={{ delay: 100 }}>
			<StakingInventory {drive} {partner} />
		</div>
		<div in:fade={{ delay: 300 }}>
			<StakedInventory {drive} {partner} />
		</div>
		<div in:fade={{ delay: 500 }}><StakeInfo {drive} {partner} /></div>
	</div>
	<div class="mobile">
		<div class="tab">
			<button
				class="tablinks"
				class:selected={currentTab === 'Staking'}
				on:click={(e) => openTab(e, 'Staking')}>INVENTORY</button
			>
			<button
				class="tablinks"
				class:selected={currentTab === 'Staked'}
				on:click={(e) => openTab(e, 'Staked')}>FLASHDRIVE</button
			>
		</div>

		{#if currentTab === 'Staking'}
			<div id="Staking" class="tabcontent" class:selected={currentTab === 'Staking'}>
				<StakingInventory {drive} {partner} />
			</div>
		{:else if currentTab === 'Staked'}
			<div id="Staked" class="tabcontent" class:selected={currentTab === 'Staked'}>
				<StakedInventory {drive} {partner} />
			</div>
		{/if}
		<!-- <div class="staking">
			<StakingInventory />
		</div
		<div class="staked">
			<StakedInventory />
		</div> -->
	</div>
</div>

<style>
	.header {
		position: relative;
		max-width: 1260px;

		display: flex;
		margin: 0 auto;
	}
	.header img {
		display: none;
		width: 161px;
		height: 38px;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
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

		color: white;
		font-size: 17px;
		text-transform: uppercase;
	}

	div > button.selected {
		font-weight: 900;
		border-bottom: 5px solid var(--primary-teal);
	}
	.tab {
		display: flex;
		justify-content: space-evenly;
		max-width: 375px;
		margin: 0 auto 10px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
	}

	.tabcontent {
		display: none;
		padding: 6px 12px;
		color: white;
	}

	.tabcontent.selected {
		display: block;
	}

	.wrapper {
		max-width: 1260px;
		margin: 0 auto;
		position: relative;
		margin-bottom: 100px;
	}
	.desktop {
		display: flex;
	}

	.mobile {
		display: none;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.header {
			margin: 0 auto 45px;
		}
		.header img {
			display: block;
		}
	}
	@media (max-width: 1260px) {
		.desktop {
			display: none;
		}
		.wrapper {
			margin-top: 133px;
		}
		.mobile {
			display: block;
		}
	}
</style>
