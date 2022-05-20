<script>
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';

	import PartnerInventory from '../../../components/inventory/PartnerInventory.svelte';
	import { partners } from 'src/utils/partners';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import { activeUser, assetsStore, partnerDrives } from 'src/stores/store';
	import { browser } from '$app/env';
	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	import DriveCard from 'src/components/flashdrive/DriveCard.svelte';
	const { openInventory } = getContext('notsimple-modal');

	let slug = $page.params.slug;
	let partner = partners.filter((e) => e.slug == slug)[0];
	let available = 0,
		staked = 0,
		total_shell = 0,
		power = 0,
		cooldown = 0;

	$: {
		if ($assetsStore.length) {
			let tempPower = 0;

			let stakedTemp = 0;
			let availableTemp = 0;
			let cooldownTemp = 0;
			$assetsStore.forEach((element) => {
				if (element.collection.collection_name == partner.collectionName) {
					if (element.isStaked && element.isStakeable) {
						stakedTemp++;
						tempPower += element.weight;
					} else if (element.isStakeable && !element.isStaked) {
						availableTemp++;
					}
				}
			});

			available = availableTemp;
			staked = stakedTemp;
			power = tempPower;
			cooldown = cooldownTemp;
		}
	}
</script>

<svelte:head>
	<title>Partner Staking | GreenRabbit Game</title>
</svelte:head>
<div class="wrapper">
	<div class="header_bg" style="background-image: url('{partner.banner}')">
		<div class="header" in:slide={{ delay: 400 }}>
			<button class="back-btn" on:click={() => goto('/partner')}>ᐸ &nbsp; All Partners</button>
			<div class="header-content">
				<h1>{partner.name}</h1>
				<div class="shell-info">
					<div class="num-staked">
						<span class="">Available to stake</span>
						<span class="teal">{available}</span>
					</div>
					<div class="num-staked">
						<span>Staked</span>
						<span class="teal">{staked}</span>
					</div>
					<div class="num-staked">
						<span>Total Shell/h</span>
						<span class="teal">{toFixedCurrency(power / 10000, 2)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="drives" in:slide={{ delay: 400 }}>
		{#if $partnerDrives[slug]}
			{#each { length: 3 } as _, i}
				<div in:fade={{ delay: i * 100 }}>
					{#if $partnerDrives[slug][i]}
						<div
							on:click={() => {
								goto(`/partner/${slug}/${$partnerDrives[slug][i].asset_id}`);
							}}
						>
							<DriveCard drive={$partnerDrives[slug][i]} {partner} />
						</div>
					{:else}
						<div
							on:click={() =>
								openInventory(PartnerInventory, { collection: partner.drivesCollection, partner })}
						>
							<DriveCard {partner} />
						</div>
					{/if}
				</div>
			{/each}
			<div><DriveCard {partner} disabled /></div>
			<div><DriveCard {partner} disabled /></div>
			<!-- {#each Array(5) as drive}
				<div class="drive-card">
					<img class="drive-image" src={drive.image} alt="" />
					<img class="drive-logo" src={drive.logo} alt="" />
					<div class="card-label">
						<span>Storage</span>
						<span class="teal">{drive.storage}</span>
					</div>
					<div class="card-label">
						<span>Staked NFTs</span>
						<span class="teal">{drive.staked}</span>
					</div>
					<div class="card-label mt-16">
						<span>Shell/h</span>
						<span class="teal">{drive.shell}</span>
					</div>
				</div>
			{/each} -->
		{/if}
		<!-- 	<div class="drive-card" on:click={() => openInventory(PartnerInventory, {})}>
			<img class="add-drive-circle" src="/icons/add_usb.svg" alt="Flashdrive circles" />
			<div class="plugin">Plug-in Flash Drive</div>
		</div>
		<div class="drive-card" on:click={() => openInventory(PartnerInventory, {})}>
			<img class="add-drive-circle" src="/icons/add_usb.svg" alt="Flashdrive circles" />
			<div class="plugin">Plug-in Flash Drive</div>
		</div> -->
	</div>
</div>

<style>
	.wrapper {
		color: white;
		width: 100%;
		margin-top: -55px;
	}
	.header_bg {
		width: 100%;
		height: 180px;

		background-position: center;
		background-size: cover;
	}
	.header {
		width: 96%;
		max-width: 1256px;
		margin: 0 auto;
	}
	.back-btn {
		padding: 14px 25px;
		background: black;
		color: white;
		border: 2px solid var(--primary-teal);
		text-transform: uppercase;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.5s;
		margin-top: 25px;
	}
	.back-btn:hover {
		background: var(--primary-teal);
		color: black;
	}
	.header-content {
		width: 100%;
		display: flex;
		align-items: center;
		margin-top: 25px;
	}
	.header-content h1 {
		font-size: 20px;
		font-weight: 900;
		white-space: nowrap;
		width: 60%;
		margin-top: -20px;
		text-transform: uppercase;
	}
	.shell-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 40%;
		font-size: 18px;
	}
	.num-staked {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		position: relative;
	}
	.num-staked .teal {
		color: var(--primary-teal);
		font-size: 20px;
		font-weight: 600;
	}
	.drives {
		width: 96%;
		max-width: 1256px;
		margin: 0 auto;
		margin-top: 65px;
		display: grid;
		justify-content: space-between;
		gap: 80px 16px;
		grid-template-columns: repeat(auto-fit, minmax(225px, max-content));
		margin-bottom: 50px;
	}
	.drive-card {
		width: 235px;
		height: 237px;
		background-image: linear-gradient(to bottom, #4b4b4b, #292828);
		cursor: pointer;
		position: relative;
		padding: 20px 10px;
	}
	.drive-card:hover {
		box-shadow: 0 0 0 2px var(--primary-teal);
	}
	.drive-card .drive-image {
		object-fit: contain;
		border: solid 3px #f121ee;
		background-color: #000;
		border-radius: 50%;
		position: absolute;
		width: 127px;
		height: 127px;
		top: -64px;
		left: 57px;
	}
	.drive-card .drive-logo {
		height: 30px;
		width: auto;
		margin: 25px auto;
		margin-top: 60px;
	}
	.drive-card .add-drive-circle {
		width: 60px;
		height: 60px;
		margin: 35px auto;
	}
	.drive-card .plugin {
		font-size: 20px;
		font-weight: 700;
		color: var(--primary-teal);
		text-align: center;
	}
	.card-label {
		display: flex;
		font-size: 16px;
		font-weight: 600;
	}
	.card-label .teal {
		color: var(--primary-teal);
		margin-left: 15px;
	}
	.mt-16 {
		margin-top: 16px;
	}
	@media (max-width: 1024px) {
		.wrapper {
			margin-top: 0;
		}
		.header-content h1 {
			width: 40%;
		}
		.shell-info {
			width: 60%;
		}
		.drives {
			justify-content: space-around;
		}
	}
	@media (max-width: 768px) {
		.header_bg {
			height: fit-content;
			background-position: left;
		}
		.back-btn {
			width: 100%;
		}

		.header-content {
			flex-direction: column;
		}
		.header-content h1 {
			text-align: center;
			width: 100%;
			margin-top: 0;
		}
		.shell-info {
			flex-direction: column;
			width: 100%;
			font-size: 16px;
			margin-bottom: 20px;
		}
		.num-staked {
			flex-direction: row;
			width: 100%;
			justify-content: space-between;
			border-bottom: 1px solid #444;
			padding-top: 5px;
		}
		.num-staked:last-child {
			border-bottom: none;
		}
		.num-staked .teal {
			font-size: 18px;
		}
	}
</style>
