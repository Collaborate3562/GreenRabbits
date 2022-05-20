<script>
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import CTAButton from './CTAButton.svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import MenuLink from './MenuLink.svelte';
	import { activeUser, userBalance, waxBalance } from '../stores/store.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	let dropdownMenu;
	let open = false;
	function logout() {
		open = false;

		window.logOut();
	}
	function toggleOpenMenu() {
		open = !open;
	}
	let openMobile = false;

	function toggleOpenMenuMobile() {
		openMobile = !openMobile;
	}
	onMount(() => {
		document.addEventListener('click', function (event) {
			if (dropdownMenu) {
				var isClickInside = dropdownMenu.contains(event.target);
				if (!isClickInside) {
					open = false;
				}
			}
		});
	});
	let innerHeight;
	function navigate(link) {
		openMobile = false;
		goto(link);
	}
	let innerWidth;
	$: {
		if (innerWidth >= 1024 && openMobile) openMobile = false;
	}

	let hodler = false;
</script>

<div class="wrapper-header">
	<div class="header" class:top-border={openMobile} class:header_open={openMobile}>
		{#if openMobile}
			<div
				style="display: flex;
			width: 100%;margin-top: 51px;
			align-content: center;
			justify-content: center;margin-left: 18px;"
			>
				<div style="flex-direction:column">
					<img
						in:fade={{ delay: 200 }}
						out:slide
						class="logo-mobile"
						class:hodler
						style="height:{hodler ? '93px' : '55px'}"
						alt="Green Rabbit Logo"
						src={hodler
							? '/assets/hodl.png'
							: 'https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1626106905/GreenRabbit/gr_logo_g6i04r_qv8acp.png'}
					/>
					<div
						in:fade={{ delay: 200 }}
						out:slide
						style="width:100%;text-align:center;padding-top: 20px;
					font-size: 18px;
					font-weight: bold;"
					>
						{$activeUser.accountName ? $activeUser.accountName : ''}
					</div>
				</div>
			</div>{:else}
			<div class="left">
				<img
					on:click={() => {
						goto('https://www.greenrabbitgame.io');
					}}
					in:fade={{ delay: 200 }}
					out:fade
					style="cursor:pointer"
					class="logo"
					alt="Green Rabbit Logo"
					src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1626106905/GreenRabbit/gr_logo_g6i04r_qv8acp.png"
				/>

				<nav class="menu">
					{#if $activeUser.accountName}
						<MenuLink first route="/hub" text="Staking" />
						<MenuLink route="/crafting" text="Crafting" />
						<MenuLink route="/missions" text="Missions" />
						<div class="divider" />
					{/if}
					<MenuLink first={!$activeUser.accountName} route="/store" text="Shop" />
					<MenuLink route="/leaderboard" text="Leaderboard" />
					{#if $activeUser.accountName}
						<MenuLink outgoing={true} route="/redeem" text="Redeem chests" />
					{/if}

					<!-- <div class="menu-item">REDEEM CHESTS</div> -->
				</nav>
			</div>
		{/if}
		<div class="right">
			{#if $activeUser.accountName}
				<div class="balances">
					<div class="shell">
						<img
							width="22"
							height="35"
							alt="Shellinium icon"
							src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629214217/GreenRabbit/shell-icon.png"
						/>
						<p class="amount">{toFixedCurrency($userBalance, 2)}</p>
					</div>
					<div class="wax">
						<img src="/icons/wax.png" width="22" height="35" alt="Wax icon" />
						<p class="amount">
							{#if $waxBalance}{toFixedCurrency($waxBalance, 2)}{:else}0.00{/if}
						</p>
					</div>
				</div>

				<div class="user" bind:this={dropdownMenu} on:click={toggleOpenMenu}>
					<p>{$activeUser.accountName.toUpperCase()}</p>

					<svg
						style="--open:{open ? '270deg' : '90deg'}"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 185.343 185.343"
					>
						<defs />
						<path
							fill="#fff"
							d="M51.707 185.343a10.692 10.692 0 01-7.593-3.149 10.724 10.724 0 010-15.175l74.352-74.347L44.114 18.32c-4.194-4.194-4.194-10.987 0-15.175 4.194-4.194 10.987-4.194 15.18 0l81.934 81.934c4.194 4.194 4.194 10.987 0 15.175l-81.934 81.939a10.678 10.678 0 01-7.587 3.15z"
						/>
					</svg>
					{#if open}
						<div class="user-menu">
							<div
								transition:fade={{ duration: 50 }}
								on:click={() => {
									goto('/inventory');
								}}
								class="desktop-user-menu"
								style="--open:{open ? 'flex' : 'none'};"
							>
								<p>Inventory</p>
							</div>
							<div
								transition:fade={{ duration: 70 }}
								on:click={() => {
									goto('/explorer');
								}}
								class="desktop-user-menu"
								style="--open:{open ? 'flex' : 'none'};margin-top:40px;"
							>
								<p>GR Asset Lookup</p>
							</div>

							<div
								transition:fade={{ duration: 90 }}
								on:click={logout}
								class="desktop-user-menu"
								style="--open:{open ? 'flex' : 'none'};margin-top:80px;"
							>
								<p>Logout</p>
							</div>
						</div>
						<!-- 	-->
					{/if}
				</div>
			{/if}
			{#if !$activeUser.accountName}
				<div
					on:click={() => {
						document.getElementById('ual-button').click();
					}}
					class="login-button"
				>
					LOGIN
				</div>
			{/if}
			{#if hodler}
				<img
					style="height:92px;object-fit:scale-down; margin-left:21px"
					src="/assets/hodl.png"
					alt=""
				/>{/if}
		</div>
		{#if !openMobile}
			<div class="mobile-balance-wrap">
				<div class="shell-mobile" class:hide={openMobile}>
					<img
						width="32"
						height="45"
						alt="Shellinium icon"
						src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629214217/GreenRabbit/shell-icon.png"
					/>
					<p class="amount">{toFixedCurrency($userBalance, 2)}</p>
				</div>
				<div class="wax-mobile" class:hide={openMobile}>
					<img src="/icons/wax.png" width="22" height="35" alt="Wax icon" />
					<p class="amount">
						{#if $waxBalance}{toFixedCurrency($waxBalance, 2)}{:else}0.00{/if}
					</p>
				</div>
			</div>
		{/if}

		<div class="mobile">
			<button
				on:click={toggleOpenMenuMobile}
				class="header__menu"
				class:header__menu--active={openMobile}
				type="button"
			>
				<span />
				<span />
				<span />
			</button>
		</div>
		{#if openMobile}
			<div class="mobile-menu" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
				<div class="mobile-menu-item" on:click={() => navigate('/inventory')}>Inventory</div>
				<div class="mobile-menu-item" on:click={() => navigate('/hub')}>Staking</div>
				<div class="mobile-menu-item" on:click={() => navigate('/crafting')}>Crafting</div>
				<div class="mobile-menu-item" on:click={() => navigate('/missions')}>Missions</div>
				<div class="mobile-menu-item" on:click={() => navigate('/leaderboard')}>Leaderboard</div>
				<div class="mobile-menu-item" on:click={() => navigate('/store')}>Store</div>
				<div class="mobile-menu-item" on:click={() => navigate('/redeem')}>Redeem Chests</div>
				{#if $activeUser.accountName}<div
						class="mobile-menu-item-big"
						on:click={() => {
							openMobile = !openMobile;
							window.logOut();
						}}
					>
						LOGOUT
					</div>{:else}
					<div
						class="mobile-menu-item-big"
						on:click={() => {
							openMobile = !openMobile;
							document.getElementById('ual-button').click();
						}}
					>
						LOGIN
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
<svelte:window bind:innerHeight bind:innerWidth />

<style>
	.mobile-balance-wrap {
		position: absolute;
		display: flex;
		flex-direction: column;

		height: 58px;

		font-size: 22px;
		margin-left: calc(100vw - 250px);
	}
	.balances {
		display: flex;
		flex-direction: column;
	}
	.hodler {
		margin-top: -32px !important;
	}
	.hidden {
		display: none !important;
	}
	.header_open {
		height: 165px !important;
	}

	.header__menu {
		position: absolute;
		width: 36px;
		height: 29px;
		display: block;
		left: -44px;
		top: 20px;
		background: transparent;
	}

	.header__menu span {
		position: absolute;
		left: 0;
		width: 24px;
		height: 2px;
		background-color: #fff;
		border-radius: 3px;
		transition: 0.5s;
		opacity: 1;
	}

	.header__menu span:first-child {
		top: 0;
		width: 26px;
	}

	.header__menu span:nth-child(2) {
		top: 8px;
		width: 26px;
	}

	.header__menu span:last-child {
		top: 16px;
		width: 26px;
	}

	.header__menu--active span:first-child {
		transform: rotate(45deg);
		top: 10px;
	}

	.header__menu--active span:nth-child(2) {
		opacity: 0;
	}

	.header__menu--active span:last-child {
		width: 26px;
		transform: rotate(-45deg);
		top: 10px;
	}

	.desktop-user-menu {
		display: var(--open);
		position: absolute;
		width: 100%;
		left: 0;
		transform: translateY(calc(100%));
		background-color: var(--dark-grey);
		padding: 10px;
		cursor: pointer;
		top: 1px;
		border: 1px solid var(--primary-teal);
	}
	.desktop-user-menu:hover {
		background-color: var(--dark-teal);
	}
	.mobile-user-info {
		margin: 24px auto 0;
	}
	.login-button {
		margin-left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 180px;
		height: 45px;
		font-size: 20px;
		cursor: pointer;
		font-weight: 900;
		color: white;
		text-transform: uppercase;
		text-decoration: none;
		text-align: center;
		border: solid 2px #36ffc0;
		background: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}

	.mobile-menu-item {
		min-height: 66px;
		font-family: Lato;

		font-size: 18px;
		text-transform: capitalize;
		font-weight: 500;
		justify-content: center;
		display: flex;
		padding: 12px;
		text-transform: uppercase;

		cursor: pointer;
		border-top: 1px solid #707070;
		vertical-align: middle;
		align-items: center;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none;
	}
	.mobile-menu-item:hover {
		background: #707070;
	}
	.mobile-menu-item-big:hover {
		background: #420000;
	}
	.mobile-menu-item-big:active {
		background: #b30000;
	}
	.mobile-menu-item:active {
		background: var(--primary-teal);
	}
	.mobile-menu-item-big {
		min-height: 132px;
		font-family: Lato;

		font-size: 18px;
		text-transform: capitalize;
		font-weight: 500;
		justify-content: center;
		display: flex;
		padding: 12px;
		text-transform: uppercase;

		cursor: pointer;
		border-top: 1px solid #707070;
		vertical-align: middle;
		align-items: center;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none;
	}
	.mobile-menu {
		display: flex;
		position: absolute;
		bottom: 0;
		transform: translateY(100%);
		width: 100%;

		flex-direction: column;

		background-color: #000;
		height: calc(100vh - 165px);
		z-index: 9999;
	}

	.mobile-user {
		margin: 0 auto;
	}
	.mobile {
		display: none;
		position: relative;
		align-items: center;
		margin-left: auto;
		/* margin-right: 18px; */
	}
	.user {
		width: 180px;
		height: 45px;
		border: solid 1px #36ffc0;
		margin-left: 42px;

		font-size: 13px;
		font-weight: 900;
		padding: 10px 18px;

		display: flex;
		align-items: center;
		position: relative;
		cursor: pointer;
	}
	.user p {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user svg {
		transform: rotate(var(--open));
		width: 15px;
		right: 8px;
		position: absolute;
	}
	.header {
		display: flex;
		position: relative;
		height: 105px;
		/* max-width: 1920px; */
		margin: 0 auto;
		color: white;
		transition: all 0.5s;
	}
	.top-border {
		border-top: 2px solid var(--primary-teal);
		margin-top: -4px;
	}
	.wrapper-header {
		border-bottom: 2px solid var(--primary-teal);
		position: sticky;
	}
	.divider {
		border-left: 1px solid white;
		height: 51px;
		margin: auto;
		display: block;
		margin-left: 13px;
		margin-right: 13px;
		opacity: 0.4;
	}
	.left {
		display: flex;
		align-items: center;
	}
	.right {
		display: flex;
		align-items: center;
		margin-right: 42px;
		margin-left: auto;
	}

	.shell {
		align-items: center;
		display: flex;
		font-size: 18px;
		margin-bottom: 4px;
	}

	.shell .amount {
		margin-left: 12px;
	}
	.wax {
		align-items: center;
		display: flex;
		font-size: 18px;
		margin-top: 4px;
	}

	.wax .amount {
		margin-left: 12px;
	}
	.shell-mobile {
		height: 58px;
		align-items: center;
		display: none;
		font-size: 22px;
	}
	.shell-mobile img {
		object-fit: scale-down;
		width: 20px;
	}
	.shell-mobile .amount {
		margin-left: 7px;
		font-size: 14px;

		font-weight: bold;
	}

	.wax-mobile {
		height: 58px;
		align-items: center;
		display: none;
		font-size: 22px;
	}
	.wax-mobile img {
		object-fit: scale-down;
		width: 20px;
	}
	.wax-mobile .amount {
		margin-left: 7px;
		font-size: 14px;

		font-weight: bold;
	}
	.logo {
		width: 65px;
		height: 40px;
		margin: 0 64px;
		position: absolute;
	}
	.logo-mobile {
		height: 93px;
		object-fit: scale-down;
		margin: -10px auto;
	}
	nav {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.menu {
		margin-left: 225px;
	}
	@media (max-width: 1280px) {
		.menu {
			margin-left: 150px;
		}
	}
	.menu-item {
		color: white;
		font-size: 20px;
		font-weight: 900;
		border-bottom: 5px solid var(--primary-teal);
		height: 100%;
		margin-right: 66px;
		align-items: center;
		display: flex;
		white-space: nowrap;
	}

	@media (max-width: 1024px) {
		.mobile {
			display: flex;
		}
		.shell-mobile {
			display: flex;
		}
		.wax-mobile {
			display: flex;
		}
		.header {
			height: 58px;
		}
		.logo {
			width: 45px;
			object-fit: scale-down;
			margin-left: 22px;
		}
		.menu,
		.right {
			display: none;
		}
		.wrapper-header {
			margin-bottom: 0px;
			position: sticky;
			top: 0;
			background: black;
			z-index: 8;
		}
	}
	@media (max-width: 1350px) {
		.menu-item {
			font-size: 16px;
			margin-right: 33px;
		}

		.user {
			margin-left: 20px;
		}
		.logo {
			margin-right: 32px;
		}
		p.amount {
			font-size: 15px;
		}
	}
	@media only screen and (max-width: 480px) {
	}
</style>
