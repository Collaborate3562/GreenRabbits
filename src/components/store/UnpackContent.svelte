<script>
	import { activeUser } from 'src/stores/store';

	import { getContext } from 'svelte';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';

	import SelectCircle from '../icons/SelectCircle.svelte';
	import ModalUnpack from '../modal/ModalUnpack.svelte';
	import { atomicAssetsApi } from 'src/utils/atomic.assets.api';
	import { getRandomInt } from 'src/utils/helpers';
	import { fly } from 'svelte/transition';
	import CongratsScreen from './CongratsScreen.svelte';
	export let nftData;
	let showSelect = false;
	let loading = false;
	let selected;
	let isLoading = false;

	let revealPack = false;
	let memo = null;
	let displayData = null;
	let claimable = null;
	let claimedData = null;
	let maxRarity = 0;
	let rng = 0;
	let doReveal;
	let lastConfig = null;
	let video = true;
	let videoplayer;
	let revealEnded = false;
	let showCongratsModal = false;
	function toggleSelect() {
		showSelect = !showSelect;
	}

	async function handleUnpack(asset, isOpened = false) {
		loading = true;
		memo = await matchConfigs(nftData.templateData, nftData.pack);
		displayData = JSON.parse(lastConfig.display_data);

		video = displayData?.animation?.drawing?.data?.video;

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
					to: nftData.pack,
					asset_ids: [asset.asset_id],
					memo: memo
				}
			}
		];

		let transaction = { actions };

		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});

			setTimeout(() => {
				// getData(true);

				handleReveal(asset); //!!!! TESTING
			}, 1000);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);

			loading = false;
		}
	}

	const rarityScale = {
		common: 0,
		uncommon: 1,
		rare: 2,
		epic: 3,
		legendary: 4,
		mythic: 5
	};
	function cleanup() {
		lastConfig = null;
		showSelect = false;
		loading = false;
		doReveal = undefined;
		selected = undefined;
		revealPack = false;
		memo = null;
		displayData = null;
		claimable = null;
		claimedData = null;
		maxRarity = 0;
		rng = 0;
		video = false;
		showCongratsModal = false;
		revealEnded = false;
	}

	function resolveAfter1Second() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, 1000);
		});
	}

	async function handleReveal(asset) {
		let claimData = null;

		while (!claimData) {
			if (nftData.pack == 'atomicpacksx') {
				greenRabbitApi.fetchClaims(asset.asset_id).then((claims) => {
					if (claims.length > 0) claimData = claims;
				});
			} else {
				greenRabbitApi.fetchClaimsNefty(asset.asset_id, 'neftyblocksp').then((claims) => {
					if (claims.length > 0) claimData = claims;
				});
			}
			await resolveAfter1Second();
		}
		if (claimData) {
			if (nftData.pack == 'atomicpacksx') revealData(claimData, asset);
			else revealData(claimData[0], asset);
		}
	}

	async function revealData(claim, asset) {
		let claimRequest = {
			claim_id: asset.asset_id,
			asset_ids: []
		};

		if (nftData.pack == 'atomicpacksx') {
			claim.forEach((c) => {
				claimRequest.asset_ids.push(c.template_id);
			});
			claimable = claimRequest;
			atomicAssetsApi.getTemplatesById(claimRequest.asset_ids).then((res) => {
				let maxRarityTemp = 0;
				for (let a of res.data) {
					if (a.immutable_data?.Rarity) {
						if (rarityScale[a.immutable_data.Rarity.toLowerCase()] > maxRarityTemp) {
							maxRarityTemp = rarityScale[a.immutable_data.Rarity.toLowerCase()];
						}
					}
					for (let c of claim) {
						c.show = true;
						if (a.template_id == c.template_id) c.templateData = a;
					}
				}
				claimedData = claim;
				//console.log('@claimeddata', claimedData);
				maxRarity = maxRarityTemp;
				rng = getRandomInt(0, 4);
				revealPack = asset;
				if (video) {
					setTimeout(() => {
						videoplayer.play();
					}, 300);
				}
			});
		} else {
			claim.claims.forEach((c) => {
				claimRequest.asset_ids.push(c.claim[1].asset_id);
			});
			claimable = claimRequest;

			atomicAssetsApi.getAssetsById(claimRequest.asset_ids).then((res) => {
				let maxRarityTemp = 0;
				for (let a of res.data) {
					if (a.template.immutable_data?.Rarity) {
						if (rarityScale[a.template.immutable_data.Rarity.toLowerCase()] > maxRarityTemp) {
							maxRarityTemp = rarityScale[a.template.immutable_data.Rarity.toLowerCase()];
						}
					}
					for (let c of claim.claims) {
						c.show = true;
						if (a.asset_id == c.claim[1].asset_id) c.templateData = a;
					}
				}
				claimedData = claim.claims;

				maxRarity = maxRarityTemp;
				rng = getRandomInt(0, 4);
				revealPack = asset;
				if (video) {
					setTimeout(() => {
						videoplayer.play();
					}, 300);
				}
			});
		}
	}

	async function handleRevealClick() {
		let actions = [];
		if (nftData.pack == 'atomicpacksx') {
			actions.push({
				account: 'atomicpacksx',
				name: 'claimunboxed',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					origin_roll_ids: Object.keys(claimable.asset_ids).map(Number),
					pack_asset_id: claimable.claim_id
				}
			});
		} else {
			actions.push({
				account: 'neftyblocksp',
				name: 'claim',
				authorization: [
					{
						actor: $activeUser.accountName,
						permission: $activeUser.requestPermission
					}
				],
				data: {
					roll_indexes: Object.keys(claimable.asset_ids).map(Number),
					claim_id: claimable.claim_id
				}
			});
		}

		let transaction = { actions };
		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});

			setTimeout(() => {
				revealKickOff();
			}, 200);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
		}
	}
	async function revealKickOff() {
		isLoading = true;
		window.getStoreData(true, () => {
			isLoading = false;
		});
		doReveal = true;
	}

	async function matchConfigs(asset) {
		if (nftData.pack) {
			const res = await greenRabbitApi.fetchPackConfig(nftData.pack, asset.template_id);

			lastConfig = res[0];
			if (
				nftData.pack === 'atomicpacksx' ||
				nftData.pack === 'neftyblpacks' ||
				nftData.pack === 'neftyblocksp'
			)
				return 'unbox';

			return lastConfig.pack_name;
		}
		return false;
	}
	async function claimOpenedPack() {
		const unclaimedAsset = await atomicAssetsApi.getAssetsById([unclaimed[0].claim_id]);

		handleUnpack(unclaimedAsset.data[0], true);
	}

	async function removeAssetFromReveal(asset) {
		claimedData = claimedData.filter(
			(item) => item.templateData.asset_id !== asset.templateData.asset_id
		);
	}

	$: {
		if (revealPack) {
			revealEnded = claimedData.length === 0;

			if (revealEnded) {
				showCongratsModal = true;
			}
		}
	}
	function getVideoUrl() {
		if (video.startsWith('http')) return video;
		else return `https://greenrabbit.mypinata.cloud/ipfs/${video}`;
	}
</script>

{#if revealPack}<div class="unpack_overlay">
		<!-- {#if true} -->
		{#if showCongratsModal}
			<CongratsScreen
				{maxRarity}
				{rng}
				isRefreshing={isLoading}
				onClose={() => {
					cleanup();
				}}
			/>
		{/if}
		{#if doReveal}
			{#each claimedData as claim, i}
				<div
					on:click={() => {
						removeAssetFromReveal(claim);
					}}
					style="display:flex;justify-content:center;align-items:center"
					in:fly={{ y: -300, duration: 400, delay: 400 + 400 * i }}
					out:fly={{ y: 300, duration: 400 }}
				>
					<div
						class="imgwrap"
						style="position:absolute;display:flex;justify-content:center;align-items:center;flex-direction:column"
					>
						<img
							style="position:absolute;max-width:300px;min-width:300px; max-height:450px;min-height:50px; object-fit:scale-down;"
							src={`https://greenrabbit.mypinata.cloud/ipfs/${
								claim.templateData.template.immutable_data.img2
									? claim.templateData.template.immutable_data.img2
									: claim.templateData.template.immutable_data.img
							}`}
							alt={claim.templateData.data.name}
						/>{#if claimedData.length == i + 1}
							<span style="margin-top:40px;">
								{claim.templateData.data.name} #{claim.templateData.template_mint} - {claim
									.templateData.data.Rarity}
							</span>{/if}
					</div>
				</div>
			{/each}
		{:else if video}
			<div
				class="skip_video_button"
				on:click={() => {
					video = false;
				}}
			>
				SKIP VIDEO
			</div>
			<video
				bind:this={videoplayer}
				style="width: 100vw;"
				on:ended={() => {
					video = false;
				}}
				src={getVideoUrl()}
			/>
		{:else}
			<img
				on:click={handleRevealClick}
				class="revealpack_image"
				style="max-width: 274px; margin: 0 auto;"
				src={`https://greenrabbit.mypinata.cloud/ipfs/${revealPack.data.img}`}
				alt="pack"
			/>

			<span
				style="
				color: white;
				display: flex;
				justify-content: center
			"
			>
				Click to reveal
			</span>
		{/if}
	</div>
{/if}
<div class="wrap">
	<h1>Unpack</h1>
	<div class="unpack-wrapper">
		<div class="image">
			<img
				alt="Success logo"
				src="https://cloudflare-ipfs.com/ipfs/{nftData.templateData.immutable_data.img}"
			/>
		</div>
		<div class="right">
			<p class="pack-name">{nftData.templateData.name}</p>
			<div class="select-area">
				<p class="label">Select a pack</p>
				<div class="dropdown" on:click={toggleSelect}>
					{#if selected}<span class="mint">Mint #{selected.template_mint}</span>
						<span class="asset-id">ID {selected.asset_id}</span>{:else}Select{/if}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 10 7"
						style="--open: {showSelect ? '180deg' : '0'}"
					>
						<defs />
						<path fill="#fff" fill-rule="evenodd" d="M0 .5l5 5 5-5H0z" />
					</svg>

					{#if showSelect}
						<div class="select-list-mobile">
							{#each nftData.assetsData as data}
								<div
									class="item"
									on:click={() => {
										selected = data;
									}}
								>
									<div class="mobile-item">
										{data.template_mint === 0 ? '' : `Mint #${data.template_mint}`} ID {data.asset_id}
										<SelectCircle {data} selectedItem={selected} />
									</div>
								</div>
							{/each}
						</div>

						<div class="select-list">
							{#each nftData.assetsData as data}
								<div
									class="item"
									on:click={() => {
										selected = data;
									}}
								>
									<span class="mint"
										>{data.template_mint === 0 ? '' : `Mint #${data.template_mint}`}</span
									>
									<span class="asset-id">ID {data.asset_id}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<ModalUnpack
					{loading}
					width="315"
					disabled={!selected}
					onClick={() => {
						handleUnpack(selected);
					}}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.skip_video_button {
		position: absolute;
		top: 30px;
		right: 60px;
		background: rgba(0, 0, 0, 0.7);
		margin: 10px;
		color: white;
		cursor: pointer;
		padding: 5px 15px;
		z-index: 99999;
		border-radius: 6px;
	}
	.revealpack_image {
		cursor: pointer;
	}
	.revealpack_image:hover {
		-webkit-animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		-webkit-perspective: 1000px;
		perspective: 1000px;
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
	}
	@-webkit-keyframes shake {
		10%,
		90% {
			-webkit-transform: translate3d(-1px, 0, 0);
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			-webkit-transform: translate3d(2px, 0, 0);
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			-webkit-transform: translate3d(-4px, 0, 0);
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			-webkit-transform: translate3d(4px, 0, 0);
			transform: translate3d(4px, 0, 0);
		}
	}
	@keyframes shake {
		10%,
		90% {
			-webkit-transform: translate3d(-1px, 0, 0);
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			-webkit-transform: translate3d(2px, 0, 0);
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			-webkit-transform: translate3d(-4px, 0, 0);
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			-webkit-transform: translate3d(4px, 0, 0);
			transform: translate3d(4px, 0, 0);
		}
	}
	.unpack_overlay {
		z-index: 99999;
		position: fixed;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		top: 0;
		left: 0;
		background-color: black;
		flex-direction: column;
	}
	.wrap {
		min-height: 519px;
		font-size: 16px;

		font-weight: bold;
	}
	h1 {
		font-size: 28px;

		font-weight: bold;
		margin: 25px 0 60px 20px;
	}
	.select-list {
		display: none;
		position: absolute;
		bottom: 0;
		left: -1px;
		width: calc(100% + 2px);
		transform: translateY(100%);
		max-height: 200px;
		border: 1px solid var(--primary-teal);
		background-color: #000;
		overflow-y: scroll;
		z-index: 1;
	}

	.select-list .item {
		height: 50px;
		display: flex;
		align-items: center;
		padding: 0 14px;

		border-top: 1px solid rgba(255, 255, 255, 0.3);
		justify-content: space-around;
	}
	.select-list .item:hover {
		background-color: var(--greenish-cyan);
		color: var(--primary-teal);
		border-top: 1px solid var(--primary-teal);
		border-bottom: 1px solid var(--primary-teal);
		margin-top: 1px;
		margin-bottom: -1px;
	}
	.select-list div:first-of-type:hover {
		border-top: none;
	}
	.select-list div:last-of-type:hover {
		border-bottom: none;
		margin-top: 0;
		margin-bottom: 0;
	}
	.select-list-mobile {
		position: fixed;
		overflow-y: scroll;
		width: 320px;
		left: 50%;
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
		height: 80vh;
		border-radius: 4px;
	}
	.mobile-item {
		position: relative;
		height: 60px;
		padding: 10px;
		display: flex;
		align-items: center;
		background-color: rgb(56, 55, 61);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
	}
	.dropdown {
		position: relative;
		width: 315px;
		height: 50px;
		border: 1px solid var(--primary-teal);
		background-color: rgba(0, 0, 0, 0);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px;
		margin: 0 auto 24px 0;
	}
	.image {
		width: 100%;
		height: 240px;
		background-color: #111;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.image img {
		width: 165px;
		height: 200px;
	}
	.unpack-wrapper {
		flex-direction: column;
		margin-bottom: 110px;
	}

	.label {
		margin-bottom: 10px;

		margin: 0 auto;
	}
	.pack-name {
		font-size: 24px;
		text-align: left;
		font-weight: 900;
		min-height: 100px;
	}

	.unpack-wrapper p.pack-name {
		margin-top: 20px;
		font-size: 18px;
		display: block;
		margin-bottom: 32px;
	}
	.select-area {
		width: 100%;
		padding: 0 22px;
		cursor: pointer;
	}

	.select-area svg {
		width: 13px;
		transform: rotate(var(--open));
	}
	.unpack-wrapper p.pack-name span {
		font-weight: 900;
	}

	@media (min-width: 768px) {
	}

	@media (min-width: 1024px) {
		.right {
			flex: 1;
		}
		.image {
			max-width: 285px;
			height: 240px;
			background-color: #000;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-right: 52px;
		}
		.image img {
			width: 285px;
			height: 345px;
		}

		.unpack-wrapper {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 0 40px;

			top: -20px;
			position: relative;
		}

		.unpack-wrapper p {
			margin-top: 32px;
			font-size: 28px;
		}
		.unpack-wrapper p.pack-name {
			margin-top: 0px;
			margin-bottom: 28px;
			font-size: 18px;
			display: block;
			padding: 0 0 0 22px;
		}

		.select-list {
			display: block;
		}
		.select-list-mobile {
			display: none;
		}
		.unpack-wrapper .right p.pack-name {
			font-weight: 900;
			font-size: 28px;
		}
	}
</style>
