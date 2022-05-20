<script context="module">
	export const load = async ({ page }) => ({
		props: {
			key: page.path
		}
	});
</script>

<script>
	export let key;
	import NotSimpleModal from 'src/components/modals/NotSimpleModal.svelte';
	import Cookies from 'js-cookie';
	import { UALJs } from 'ual-plainjs-renderer';
	import { Anchor } from 'ual-anchor';
	import { Wax } from '@eosdacio/ual-wax';
	import {
		WAX_CHAIN_ID,
		WAX_BASE_ENDPOINT_HOST,
		STAKING_CONTRACT,
		PROMO_CONTRACT,
		REFRESH_BALANCE_SECONDS,
		TESTNET,
		CRAFTING_CONTRACT
	} from '../utils/config';
	import { onMount } from 'svelte';

	import {
		activeUser,
		userBalance,
		promoBalancesStore,
		promoCollectionsStore,
		assets,
		promoAssetsStore,
		loadingString,
		collectionsStore,
		termsAccepted,
		accountStore,
		assetsInPool,
		assetsStore,
		drivesStore,
		storageStore,
		driveAssetsStore,
		dataLoaded,
		allAssetsStore,
		loadingPercent,
		isDataLoading,
		isDataWaiting,
		notClaimedStore,
		configsStore,
		salesStore,
		storeLoaded,
		storeLoadingPercent,
		storeLoadingProgress,
		craftingLog,
		now,
		craftingState,
		craftingStep,
		waitingConfirmationCrafting,
		craftingResult,
		cookieStatus,
		announcementSeen,
		isAssetsLoading,
		waxBalance,
		inventoryOpen
	} from '../stores/store.js';

	import Header from 'src/components/Header.svelte';
	import Footer from 'src/components/Footer.svelte';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import {
		isEmpty,
		isStaked,
		isPromoStaked,
		zeroPad,
		numberWithCommas,
		getBoostData
	} from 'src/utils/helpers';
	import getStakingData from 'src/utils/matcher';
	import { browser } from '$app/env';

	import GoogleAnalytics from 'src/modules/GoogleAnalytics.svelte';
	import SimpleModal from 'src/components/SimpleModal.svelte';

	import { goto } from '$app/navigation';

	import DataLoading from 'src/components/DataLoading.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import LoginScreen from 'src/components/LoginScreen.svelte';
	import PageTransition from 'src/components/misc/PageTransition.svelte';
	import { page } from '$app/stores';
	import Toast from 'src/components/misc/Toast.svelte';
	import TosModal from 'src/components/misc/TOSModal.svelte';

	import Timer from 'src/components/Timer.svelte';
	import { CRAFTING_STATE_INIT } from 'src/utils/constants';
	import CookieDisclaimer from 'src/components/misc/CookieDisclaimer.svelte';
	import ImportantAnnouncement from 'src/components/misc/ImportantAnnouncement.svelte';
	import { env } from 'src/utils/variables';
	import { inStats } from 'src/stores/missionStores';

	let ual;
	const mock = [
		{
			itemtemplate: 92715,
			collection: 'lightcollect',
			itemcost: '1.0000 SHELL',
			pool: 0,
			poolAccount: '',
			whitelist: 0,
			pack: 'atomicpacksx',
			indivmax: 10,
			collected: 50,
			maxcollect: 150,
			starttime: Math.floor(Date.now() / 1000 + 15),
			endtime: Math.floor(Date.now() / 1000 + 30)
		}
	];

	const myCallback = (arrayOfUsers) => {
		$activeUser = arrayOfUsers[0];

		// if /missions, do the big load in the background
		if ($page.path.includes('missions')) {
			$dataLoaded = true;
			$loadingPercent = 0;

			document.body.style.overflow = 'scroll';
			document.body.style.overflowX = 'hidden';
			document.getElementById('loader').classList.add('hideloader');

			refresh(false, 0);

			return;
		}

		$dataLoaded = false;
		$loadingPercent = 0;
		document.body.style.overflow = 'hidden';
		document.getElementById('loader').classList.remove('hideloader');

		refresh(true, 0);

		if ($page.path.includes('shop')) getStoreData(false, () => {}, mock);
	};

	$: {
		if (browser) {
			console.log($loadingString);
			document.getElementById('progress-bar').style.width = `${$loadingPercent}%`;
			if ($loadingString == 'done') {
				if (TESTNET) console.log('loading stats', loadingStats);
				lastLoadingString = '';
				loadingStats = [];
				let total = 0;
				document.body.style.overflow = 'scroll';
				document.body.style.overflowX = 'hidden';
				document.getElementById('loader').classList.add('hideloader');
			}
		}
	}

	//some debug stats!
	let lastLoadingString = '';
	let lastTime = Date.now();
	let loadingStats = [];
	let total = 0;
	$: {
		if (browser) {
			if ($loadingString != lastLoadingString) {
				const now = Date.now();
				const diff = now - lastTime;
				total += diff;
				lastTime = now;
				lastLoadingString = $loadingString;
				loadingStats.push({ phase: lastLoadingString, ms: diff, totalTime: total });
			}
		}
	}

	let storeCallback = () => {};

	async function getStoreData(refresh = false, callback = () => {}) {
		storeCallback = callback;

		$storeLoadingProgress = {
			sales: false,
			indiv: false
		};
		size = 0;
		done = 0;
		percent = 0;
		if (!refresh) {
			$storeLoaded = false;
		}
		$isDataLoading = true;

		$loadingString = 'Getting store data';
		greenRabbitApi.fetchShopData($activeUser).then((e) => {
			$salesStore = e.sales;
			$storeLoadingProgress.sales = true;
			$storeLoadingProgress.indiv = true;
		});
	}
	var size = 0;
	var done = 0;
	var percent = 0;
	$: {
		if (browser) {
			if ($storeLoadingProgress) {
				size = Object.keys($storeLoadingProgress).length;
				done = 0;
				percent = 0;
				Object.keys($storeLoadingProgress).forEach((element) => {
					if ($storeLoadingProgress[element]) done++;
				});
				percent = Math.ceil((done * 100) / size);
				$storeLoadingPercent = percent;
			}
		}
	}
	$: {
		if (browser) {
			if (percent == 100 && $dataLoaded) {
				$storeLoaded = true;
				$isDataLoading = false;
				storeCallback();
			}
		}
	}
	async function loadData(callback) {
		lastTime = Date.now();
		$isDataLoading = true;

		if (!$activeUser.accountName) {
			$userBalance = 0;
		}
		$loadingString = 'Fetching Balance';
		$loadingPercent = 6;
		$userBalance = await greenRabbitApi.fetchBalance($activeUser);
		const data2 = await greenRabbitApi.fetchWaxBalance($activeUser);

		$waxBalance = data2;
		$loadingString = 'Fetching Promo Collections';
		$loadingPercent = 12;
		const promoCollections = await greenRabbitApi.fetchCollections(PROMO_CONTRACT);
		$promoCollectionsStore = promoCollections;

		$loadingString = 'Fetching Promo Balances';
		$loadingPercent = 18;
		const promoBalances = await greenRabbitApi.fetchPromoBalance($activeUser, promoCollections);
		$promoBalancesStore = promoBalances;

		$loadingString = 'Fetching Weights';
		$loadingPercent = 24;
		const weights = await greenRabbitApi.fetchWeights(PROMO_CONTRACT);

		$loadingString = 'Fetching Promo Assets';
		$loadingPercent = 30;
		const promoassets = await greenRabbitApi.fetchPromos($activeUser, weights);

		$loadingString = 'Fetching Promo Pool Assets';
		$loadingPercent = 36;
		const promoPoolAssets = await greenRabbitApi.fetchPromoPoolAssets($activeUser);
		matchPromoWeights(promoassets, weights, promoPoolAssets);

		$loadingString = 'Fetching Collections';
		$loadingPercent = 42;
		const collections = await greenRabbitApi.fetchCollections(STAKING_CONTRACT);
		$collectionsStore = collections;

		$loadingString = 'Fetching all assets';
		$loadingPercent = 50;
		const allAssets = await greenRabbitApi.fetchAllAssets($activeUser, collections);

		$allAssetsStore = allAssets.data;

		$loadingString = 'Checking Terms';
		$loadingPercent = 56;
		const terms = await greenRabbitApi.checkTerms($activeUser);
		if (terms) $termsAccepted = 'accepted';
		else $termsAccepted = 'notaccepted';

		$loadingString = 'Fetching account';
		$loadingPercent = 62;
		const account = await greenRabbitApi.fetchAccount($activeUser);
		$accountStore = account;

		$loadingString = 'Fetching Assets';
		$loadingPercent = 68;
		const assetsPool = await greenRabbitApi.fetchAssets($activeUser);
		$assetsInPool = assetsPool;
		$loadingString = 'Fetching Pool Assets';
		$loadingPercent = 74;
		/* 	const poolassets = await greenRabbitApi.fetchPoolAssets($activeUser, collections); */

		$loadingString = 'Fetching Drives';
		$loadingPercent = 80;
		const drives = await greenRabbitApi.fetchDrives($activeUser, collections);
		$drivesStore = addPercentageToDrives(drives);
		$loadingString = 'Calculating storage';
		$loadingPercent = 86;
		$storageStore = await greenRabbitApi.fetchStorage($activeUser, collections);
		$loadingString = 'Fetching Plugged in Drives';
		$loadingPercent = 92;
		const driveAssets = await greenRabbitApi.fetchPoolDriveAssets($activeUser, collections);
		$driveAssetsStore = driveAssets.data;
		$loadingString = 'Fetching Crafting Log';
		$loadingPercent = 96;
		const craftLog = await greenRabbitApi.fetchCraftLog($activeUser);
		const outcomesMain = await greenRabbitApi.fetchOutcomes(CRAFTING_CONTRACT);
		$craftingLog = craftLog;
		$loadingString = 'Fetching Pool Weights';
		$loadingPercent = 100;

		const weightsMain = await greenRabbitApi.fetchWeights(STAKING_CONTRACT);
		matchWeights(allAssets.data, weightsMain, assetsPool, true, outcomesMain);
		matchWeights(allAssets.data, weightsMain, assetsPool);

		callback(true);

		if (TESTNET)
			console.log(
				'loading complete',
				$activeUser,
				'userBalance',
				$userBalance,
				'promoBalancesStore',
				$promoBalancesStore,
				'promoCollectionsStore',
				$promoCollectionsStore,
				'assets',
				$assets,
				'promoAssetsStore',
				$promoAssetsStore,
				'collectionsStore',
				$collectionsStore,
				'termsAccepted',
				$termsAccepted,
				'accountStore',
				$accountStore,
				'assetsInPool',
				$assetsInPool,
				'assetsStore',
				$assetsStore,
				'drivesStore',
				$drivesStore,
				'storageStore',
				$storageStore,
				'driveAssetsStore',
				$driveAssetsStore,
				'allAssetsStore',
				$allAssetsStore,
				'craftingLog',
				$craftingLog
			);
		setTimeout(() => {
			$isDataLoading = false;
		}, 300);
	}
	async function loadPromoAssets(callback) {
		lastTime = Date.now();
		$isDataLoading = true;

		$loadingString = 'Fetching Promo Collections';
		$loadingPercent = 12;
		const promoCollections = await greenRabbitApi.fetchCollections(PROMO_CONTRACT);
		$promoCollectionsStore = promoCollections;

		$loadingString = 'Fetching Promo Balances';
		$loadingPercent = 18;
		const promoBalances = await greenRabbitApi.fetchPromoBalance($activeUser, promoCollections);
		$promoBalancesStore = promoBalances;

		$loadingString = 'Fetching Weights';
		$loadingPercent = 24;
		const weights = await greenRabbitApi.fetchWeights(PROMO_CONTRACT);

		$loadingString = 'Fetching Promo Assets';
		$loadingPercent = 30;
		const promoassets = await greenRabbitApi.fetchPromos($activeUser, weights);

		$loadingString = 'Fetching Promo Pool Assets';
		$loadingPercent = 36;
		const promoPoolAssets = await greenRabbitApi.fetchPromoPoolAssets($activeUser);
		matchPromoWeights(promoassets, weights, promoPoolAssets);

		callback(true);
		setTimeout(() => {
			$isDataLoading = false;
		}, 300);
	}

	async function loadStakingStats(callback) {
		lastTime = Date.now();
		$isDataLoading = true;

		$loadingString = 'Fetching Balance';
		$loadingPercent = 6;
		$userBalance = await greenRabbitApi.fetchBalance($activeUser);
		const data2 = await greenRabbitApi.fetchWaxBalance($activeUser);

		$waxBalance = data2;
		$loadingString = 'Fetching Promo Balances';
		$loadingPercent = 18;
		const promoBalances = await greenRabbitApi.fetchPromoBalance(
			$activeUser,
			$promoCollectionsStore
		);
		$promoBalancesStore = promoBalances;

		$loadingString = 'Fetching account';
		$loadingPercent = 62;
		const account = await greenRabbitApi.fetchAccount($activeUser);
		$accountStore = account;

		$loadingString = 'Loading staked USBs';
		$loadingPercent = 86;
		$storageStore = await greenRabbitApi.fetchStorage($activeUser, $collectionsStore);

		callback(true);
		setTimeout(() => {
			$isDataLoading = false;
		}, 300);
	}
	async function loadFlashDrives(callback) {
		lastTime = Date.now();
		$isDataLoading = true;

		$loadingString = 'Fetching Drives';
		$loadingPercent = 80;
		const drives = await greenRabbitApi.fetchDrives($activeUser, $collectionsStore);
		$drivesStore = addPercentageToDrives(drives);
		$loadingString = 'Calculating storage';
		$loadingPercent = 86;
		$storageStore = await greenRabbitApi.fetchStorage($activeUser, $collectionsStore);
		$loadingString = 'Fetching Plugged in Drives';
		$loadingPercent = 92;
		const driveAssets = await greenRabbitApi.fetchPoolDriveAssets($activeUser, $collectionsStore);
		$driveAssetsStore = driveAssets.data;

		callback(true);
		setTimeout(() => {
			$isDataLoading = false;
		}, 300);
	}
	async function refreshCraftLogData(callback) {
		lastTime = Date.now();
		$loadingString = 'Fetching Crafting Data';
		$isDataLoading = true;
		const craftLog = await greenRabbitApi.fetchCraftLog($activeUser);
		$craftingLog = craftLog;

		callback(true);
		setTimeout(() => {
			$isDataLoading = false;
		}, 300);
	}

	function bumpLoadingPercent() {
		$loadingPercent += 100 / 16;
	}

	async function loadAssets(callback) {
		lastTime = Date.now();
		$isDataLoading = true;
		$isAssetsLoading = true;
		if (!$activeUser.accountName) {
			$userBalance = 0;
		}

		$loadingString = 'Loading';

		const weights = await greenRabbitApi.fetchWeights(PROMO_CONTRACT);
		bumpLoadingPercent();

		const weightsMain = await greenRabbitApi.fetchWeights(STAKING_CONTRACT);
		const outcomesMain = await greenRabbitApi.fetchOutcomes(CRAFTING_CONTRACT);
		bumpLoadingPercent();

		$loadingString = 'Loading.';

		let parallel1 = [
			async function () {
				$userBalance = await greenRabbitApi.fetchBalance($activeUser);
				const data2 = await greenRabbitApi.fetchWaxBalance($activeUser);

				$waxBalance = data2;
				bumpLoadingPercent();
			},
			async function () {
				const collections = await greenRabbitApi.fetchCollections(STAKING_CONTRACT);
				$collectionsStore = collections;
				bumpLoadingPercent();
			},
			async function () {
				const terms = await greenRabbitApi.checkTerms($activeUser);
				bumpLoadingPercent();
				if (terms) $termsAccepted = 'accepted';
				else $termsAccepted = 'notaccepted';
			},
			async function () {
				const account = await greenRabbitApi.fetchAccount($activeUser);
				$accountStore = account;
				bumpLoadingPercent();
			},
			async function () {
				const assetsPool = await greenRabbitApi.fetchAssets($activeUser);
				$assetsInPool = assetsPool;
				bumpLoadingPercent();
			},
			async function () {
				const promoCollections = await greenRabbitApi.fetchCollections(PROMO_CONTRACT);
				$promoCollectionsStore = promoCollections;
				bumpLoadingPercent();
			},
			async function () {
				const promoassets = await greenRabbitApi.fetchPromos($activeUser, weights);
				const promoPoolAssets = await greenRabbitApi.fetchPromoPoolAssets($activeUser);
				matchPromoWeights(promoassets, weights, promoPoolAssets);
				bumpLoadingPercent();
			}
		];

		await Promise.all(parallel1.map((f) => f()));

		$loadingString = 'Loading..';

		let parallel2 = [
			async function () {
				const promoBalances = await greenRabbitApi.fetchPromoBalance(
					$activeUser,
					$promoCollectionsStore
				);
				$promoBalancesStore = promoBalances;
				bumpLoadingPercent();
			},
			async function () {
				const drives = await greenRabbitApi.fetchDrives($activeUser, $collectionsStore);
				$drivesStore = addPercentageToDrives(drives);
				bumpLoadingPercent();
			},
			async function () {
				const allAssets = await greenRabbitApi.fetchAllAssets($activeUser, $collectionsStore);
				$allAssetsStore = allAssets.data;
				bumpLoadingPercent();
			},
			async function () {
				const driveAssets = await greenRabbitApi.fetchPoolDriveAssets(
					$activeUser,
					$collectionsStore
				);
				$driveAssetsStore = driveAssets.data;
				bumpLoadingPercent();
			},
			async function () {
				$storageStore = await greenRabbitApi.fetchStorage($activeUser, $collectionsStore);
				bumpLoadingPercent();
			}
		];

		await Promise.all(parallel2.map((f) => f()));

		$loadingString = 'Loading...';

		const poolassets = await greenRabbitApi.fetchPoolAssets($activeUser, $collectionsStore);
		bumpLoadingPercent();

		matchWeights($allAssetsStore, weightsMain, $assetsInPool, true, outcomesMain);
		matchWeights($allAssetsStore, weightsMain, $assetsInPool);

		callback(true);

		setTimeout(() => {
			$isDataLoading = false;
			$isAssetsLoading = false;
		}, 300);
	}
	function addPercentageToDrives(drivesArray) {
		drivesArray.forEach((drive) => {
			drive.fillPercent = Math.floor(drive.space_used * 100) / drive.capacity;
		});
		return drivesArray;
	}
	const nameToTotem = {
		Cat: ['Cat Totem', 'Cat', 'Felicia'],
		Snake: ['Snake Totem', 'Snake', 'General Saw-Scale'],
		Turtle: ['Turtle Totem', 'Turtle', 'Mark Tortuga'],
		Rabbit: ['Rabbit Totem', 'Rabbit', 'Albert'],
		Wormhole: ['Wormhole'],
		Shellinium: ['Shellinium']
	};

	function getTotemByName(name) {
		for (let totem of Object.keys(nameToTotem)) {
			let matches = nameToTotem[totem];
			for (let match of matches) {
				if (name.includes(match)) {
					return totem;
				}
			}
		}
		return '';
	}
	function matchOutcomes(asset, outcomes) {
		for (let outcome in outcomes) {
			if (
				outcomes[outcome].totem == asset.data.Totem &&
				outcomes[outcome].rarity == asset.data.Rarity
			) {
				return outcomes[outcome].base_attributes;
			}
		}
	}
	async function matchWeights(assets, weights, stakedAssets, all = false, outcomes = null) {
		if (all) {
		}
		$loadingString = 'Matching weights';
		if (!assets || !weights || !stakedAssets) return;
		let c = 0;
		if (assets.length == 0) {
			$assetsStore = assets;
			$loadingString = 'done';
			$dataLoaded = true;
		} else {
			for (let asset of assets) {
				$loadingString = 'Matching weights - ' + c + '/' + assets.length;
				c++;
				asset.isStakeable = false;
				asset.isStaked = isStaked(asset, stakedAssets);
				asset.weight = 0;
				asset.totem = getTotemByName(asset.name);
				asset.size = 0;
				if (asset.schema.schema_name == 'greenprints' && outcomes) {
					asset.baseStats = matchOutcomes(asset, outcomes);
					asset.bonusStats = getBoostData(asset);
				}
				var stakingData = {};
				for (let e of weights) {
					if (isEmpty(stakingData)) stakingData = getStakingData(asset, e.configs, e.schema);
				}

				if (!isEmpty(stakingData)) {
					asset.isStakeable = true;
					asset.weight = stakingData.weight;
					asset.size = stakingData.size;
				}
				if (c == assets.length) {
					if (all) {
						$allAssetsStore = assets;
					}
					$assetsStore = assets;
					$loadingString = 'done';

					$dataLoaded = true;
				}
			}
		}
	}
	function logOut() {
		ual.logoutUser();
		$loadingPercent = 0;
		$loadingString = 'Initializing';
		$dataLoaded = false;
		$activeUser = { initialLoad: false };
		$userBalance = 0;
		$promoCollectionsStore = [];
		$promoBalancesStore = [];
		$promoAssetsStore = [];
		$assets = [];
		$loadingString = 'Initializing';
		$collectionsStore = [];
		$termsAccepted = 'unknown';
		$accountStore = null;
		$assetsInPool = [];
		$assetsStore = [];
		$storeLoaded = false;
		$salesStore = [];
		$storeLoadingProgress = {
			notClaimed: false,
			indiv: false
		};

		$craftingLog = null;
		$craftingStep = 1;
		$waitingConfirmationCrafting = false;
		$craftingResult = null;
		$craftingState = JSON.parse(JSON.stringify(CRAFTING_STATE_INIT));
		goto('/');
	}

	async function matchPromoWeights(collections, weights, stakedAssets) {
		$loadingString = 'Matching promo Weights';
		if (!weights || !stakedAssets) return;
		collections.forEach((assets) => {
			assets?.data.forEach((asset) => {
				var c = 1;
				const amount = collections.length * assets.length;
				$loadingString = 'Matching promo Weights - ' + c + '/' + amount;
				asset.isStakeable = false;
				asset.isStaked = isPromoStaked(asset, stakedAssets);
				asset.weight = 0;
				asset.size = 0;
				var stakingData = {};
				weights.forEach((e) => {
					if (isEmpty(stakingData)) stakingData = getStakingData(asset, e.configs, e.schema);
				});
				if (!isEmpty(stakingData)) {
					asset.isStakeable = true;
					asset.weight = stakingData.weight;
					asset.size = stakingData.size;
				}
			});
		});
		$loadingString = 'Matching promo Weights - DONE!';
		$promoAssetsStore = collections;
	}

	async function init() {
		$userBalance = 0;
	}
	async function refreshBalance() {
		/* 	$loadingString = 'Refreshing Balances';
		$isDataLoading = true; */
		const bal = await greenRabbitApi.fetchBalance($activeUser);

		const data2 = await greenRabbitApi.fetchWaxBalance($activeUser);
		$userBalance = bal;
		$waxBalance = data2;
		/* 	setTimeout(() => {
			$isDataLoading = false;
			$loadingString = 'done';
		}, 1000); */
	}
	async function startTimers() {
		window.setInterval(async () => {
			if ($activeUser.accountName) {
				$loadingString = 'Refreshing Balances';
				$isDataLoading = true;
				const bal = await greenRabbitApi.fetchBalance($activeUser);
				const data2 = await greenRabbitApi.fetchWaxBalance($activeUser);
				$waxBalance = data2;
				$userBalance = bal;
				setTimeout(() => {
					$isDataLoading = false;
					$loadingString = 'done';
				}, 1000);
			}
			if ($page.path.includes('store')) getStoreData(true, () => {});
		}, REFRESH_BALANCE_SECONDS * 1000);
	}

	onMount(() => {
		$announcementSeen = !!localStorage.getItem('announcementSeen');
		document.getElementById('version-number').innerHTML = 'v' + env.version + '-' + env.commit;
		if (Cookies.get('policyAccepted') !== 'true') {
			$cookieStatus = false;
		}

		if (!$dataLoaded) {
			document.getElementById('storage-bar').style.display = `flex`;

			console.log(`

        _____      ___________
   _____\\    \\_    \\          \\
  /     /|     |    \\    /\\    \\
 /     / /____/|     |   \\_\\    |
|     | |_____|/     |      ___/
|     | |_________   |      \\  ____
|\\     \\|\\        \\ /     /\\ \\/    \\
| \\_____\\|    |\\__//_____/ |\\______|
| |     /____/| | ||     | | |     |
 \\|_____|     |\\|_||_____|/ \\|_____|
        |____/

		LFG!
		`);
			const myChain = {
				chainId: WAX_CHAIN_ID,
				name: 'WAX',
				rpcEndpoints: [
					{
						protocol: 'https',
						host: WAX_BASE_ENDPOINT_HOST,
						port: 443
					}
				]
			};

			const myAppName = 'GreenRabbit Game';

			const anchor = new Anchor([myChain], { appName: myAppName });
			const wax = new Wax([myChain]);
			const style = `
      #ual-button {
		display:none
    	`;
			const myAppRoot = {
				containerElement: document.getElementById('my-ual-app'),
				buttonStyleOverride: style
			};
			let auths = [wax, anchor];
			if (TESTNET) {
				auths = [anchor];
			}
			ual = new UALJs(myCallback, [myChain], myAppName, auths, myAppRoot);
			/* myCallback([{accountName:'drprophetest'}]) */
			ual.init();
			window.logOut = logOut;

			window.refresh = refresh;
			window.refreshStakingStats = refreshStakingStats;
			window.refreshPromoAssets = refreshPromoAssets;
			window.refreshFlashDrives = refreshFlashDrives;
			window.refreshAssets = refreshAssets;
			window.waitForClaimStats = waitForClaimStats;
			window.refreshCraftLogs = refreshCraftLogs;
			window.getStoreData = getStoreData;
			window.refreshBalance = refreshBalance;
			setTimeout(() => {
				if (!$activeUser.accountName) {
					$loadingPercent = 50;
					setTimeout(() => {
						$loadingPercent = 100;
						setTimeout(() => {
							$dataLoaded = true;
							document.body.style.overflow = 'scroll';
							document.body.style.overflowX = 'hidden';
							document.getElementById('loader').classList.add('hideloader');
							$loadingPercent = 0;
						}, 500);
					}, 300);
				}
			}, 2000);
			startTimers();
		}
	});
	function refresh(loader = true, timeout = 2000, callback = () => {}) {
		setTimeout(() => {
			if ($activeUser.accountName) {
				$loadingString = '';

				if (browser && loader) {
					document.body.style.overflow = 'hidden';

					document.getElementById('loader').classList.remove('hideloader');
				}
				loadData(callback);
			} else {
				if ($activeUser.initialLoad) {
					if (browser && loader) {
						document.body.style.overflow = 'scroll';
						document.body.style.overflowX = 'hidden';
						document.getElementById('loader').classList.add('hideloader');
					}
					init();
				}
			}
		}, timeout);
	}
	function refreshCraftLogs(loader = true, timeout = 2000, callback = () => {}) {
		setTimeout(() => {
			if ($activeUser.accountName) {
				$loadingString = '';

				if (browser && loader) {
					document.body.style.overflow = 'hidden';

					document.getElementById('loader').classList.remove('hideloader');
				}
				refreshCraftLogData(callback);
			} else {
				if ($activeUser.initialLoad) {
					if (browser && loader) {
						document.body.style.overflow = 'scroll';
						document.body.style.overflowX = 'hidden';
						document.getElementById('loader').classList.add('hideloader');
					}
					init();
				}
			}
		}, timeout);
	}

	async function waitForClaimStats(callback) {
		let isDone = false;
		$isDataWaiting = true;
		let promoData = false;
		let stakingData = false;
		while (!isDone) {
			setTimeout(async () => {
				const promoBalances = await greenRabbitApi.fetchPromoBalance(
					$activeUser,
					$promoCollectionsStore
				);

				promoBalances.forEach((e) => {
					if (e.balance.staked > 0) {
						if (e.balance.balance != '0.00') {
							promoData = true;
						}
					} else promoData = true;
				});
				if ($drivesStore.staked > 0) {
					const account = await greenRabbitApi.fetchAccount($activeUser);
					if (account.collected != '0.0000 SHELL') stakingData = true;
				} else stakingData = true;

				isDone = promoData && stakingData;
				if (isDone) {
					$isDataWaiting = false;
					callback(true);
				}
			}, 4000);
		}
	}
	function refreshAssets(loader = true, timeout = 2000, callback = () => {}) {
		setTimeout(() => {
			if ($activeUser.accountName) {
				$loadingString = '';

				if (browser && loader) {
					document.body.style.overflow = 'hidden';

					document.getElementById('loader').classList.remove('hideloader');
				}
				loadAssets(callback);
			} else {
				if ($activeUser.initialLoad) {
					if (browser && loader) {
						document.body.style.overflow = 'scroll';
						document.body.style.overflowX = 'hidden';
						document.getElementById('loader').classList.add('hideloader');
					}
					init();
				}
			}
		}, timeout);
	}

	function refreshStakingStats(loader = true, timeout = 2000, callback = () => {}) {
		setTimeout(() => {
			if ($activeUser.accountName) {
				$loadingString = '';

				if (browser && loader) {
					document.body.style.overflow = 'hidden';

					document.getElementById('loader').classList.remove('hideloader');
				}
				loadStakingStats(callback);
			} else {
				if ($activeUser.initialLoad) {
					if (browser && loader) {
						document.body.style.overflow = 'scroll';
						document.body.style.overflowX = 'hidden';
						document.getElementById('loader').classList.add('hideloader');
					}
					init();
				}
			}
		}, timeout);
	}
	function refreshFlashDrives(loader = true, timeout = 2000, callback = () => {}) {
		setTimeout(() => {
			if ($activeUser.accountName) {
				$loadingString = '';

				if (browser && loader) {
					document.body.style.overflow = 'hidden';

					document.getElementById('loader').classList.remove('hideloader');
				}
				loadFlashDrives(callback);
			} else {
				if ($activeUser.initialLoad) {
					if (browser && loader) {
						document.body.style.overflow = 'scroll';
						document.body.style.overflowX = 'hidden';
						document.getElementById('loader').classList.add('hideloader');
					}
					init();
				}
			}
		}, timeout);
	}

	function refreshPromoAssets(loader = true, timeout = 2000, callback = () => {}) {
		setTimeout(() => {
			if ($activeUser.accountName) {
				$loadingString = '';

				if (browser && loader) {
					document.body.style.overflow = 'hidden';

					document.getElementById('loader').classList.remove('hideloader');
				}
				loadPromoAssets(callback);
			} else {
				if ($activeUser.initialLoad) {
					if (browser && loader) {
						document.body.style.overflow = 'scroll';
						document.body.style.overflowX = 'hidden';
						document.getElementById('loader').classList.add('hideloader');
					}
					init();
				}
			}
		}, timeout);
	}
</script>

{#if !$cookieStatus}
	<CookieDisclaimer />
{/if}

{#if !$announcementSeen && $cookieStatus}
	<ImportantAnnouncement />
{/if}
{#if $isDataLoading}
	<div in:fade={{ duration: 50 }} out:fade={{ duration: 50 }}>
		<DataLoading />
	</div>
{/if}
<Timer />
<Toast />
<div class="wrapper" class:blured={$inStats} class:inMissions={$page.path.includes('missions')}>
	<SimpleModal>
		<NotSimpleModal
			on:closed={() => {
				$inventoryOpen = false;
			}}
		>
			<Header />
			{#if $activeUser.accountName}
				{#if $termsAccepted == 'notaccepted'}
					<TosModal />
				{:else}
					<div class="gradient-bg" />
					<PageTransition refresh={key}>
						<slot />
					</PageTransition>
				{/if}
			{:else if $page.path.includes('explorer') || $page.path.includes('leaderboard') || $page.path.includes('store')}
				<div class="gradient-bg" />
				<PageTransition refresh={key}>
					<slot />
				</PageTransition>
			{:else}
				<LoginScreen />
			{/if}
			<div class="push" />
		</NotSimpleModal></SimpleModal
	>
</div>
<Footer />

<GoogleAnalytics id="G-ZDQ4Y2V0FR" />

<style>
	.inMissions {
		background-image: url('/assets/mission/bg.png');
		background-repeat: no-repeat;
		background-size: 100%;
		background-position-y: 108px;
		background-color: rgba(0, 0, 0, 0.3);
		background-blend-mode: soft-light;
		min-height: calc(100vh - 173px);
		width: 100%;
		height: 100%;
		transition: all 0.5s ease-in-out;
	}

	.wrapper {
		min-height: 100vh;

		margin-bottom: -66px;
	}
	.push {
		height: 66px;
	}
	@media (max-width: 1024px) {
		.wrapper {
			min-height: 100vh;

			margin-bottom: -165px;
		}
		.push {
			height: 165px;
		}
	}
	.gradient-bg {
		height: 55px;
		background: linear-gradient(
			180deg,
			rgba(54, 255, 191, 0.342) 0%,
			rgba(54, 255, 192, 0) 30%,
			rgba(54, 255, 192, 0) 100%
		);
	}
	@media (max-width: 1024px) {
		.gradient-bg {
			position: absolute;
			top: 54px;
			width: 100%;
		}
	}

	@media (max-width: 768px) {
		.inMissions {
			background-position-x: -240px;
			background-size: auto;
		}
	}
</style>
