import { writable } from 'svelte/store';
export const activeUser = writable({ initialLoad: true });
export const userBalance = writable(0);
export const waxBalance = writable(0);
export const promoCollectionsStore = writable([]);
export const promoBalancesStore = writable([]);
export const promoAssetsStore = writable([]);
export const assets = writable([]);
export const loadingString = writable('Initializing');
export const collectionsStore = writable([]);
export const termsAccepted = writable('unknown');
export const accountStore = writable(null);
export const assetsInPool = writable([]);
export const assetsStore = writable([]);
export const drivesStore = writable([]);
export const storageStore = writable([]);
export const offersStore = writable([]);
export const offersLoaded = writable(false);
export const driveAssetsStore = writable([]);
export const dataLoaded = writable(false);
export const inventorySelected = writable('none');
export const lastSelected = writable('none');
export const allAssetsStore = writable([]);
export const modal = writable(null);
export const isNavigating = writable(false);
export const loadingPercent = writable(0);
export const isDataLoading = writable(false);
export const isDataWaiting = writable(false);
export const lastPage = writable('/');
export const scrollToID = writable(null);
export const isAssetsLoading = writable(false);
//shop stores
export const storeLoaded = writable(false);
export const storeLoadingPercent = writable(0);
export const notClaimedStore = writable([]);
export const configsStore = writable([]);
export const salesStore = writable([]);
export const storeLoadingProgress = writable({
	notClaimed: false,
	indiv: false
});

//misc
export const slideLeft = writable(false);
export const inventoryOpen = writable(false); //GP Inventory
export const craftingState = writable({
	fourcomponent: { slot1: null, slot2: null, slot3: null, slot4: null, aux: null, status: 0 },
	figurecrafting: { slot1: null, status: 0 },
	boostingcrafting: { slot1: null, slot2: null, status: 0 },
	fusionCrafting: {
		slot1: null,
		slot2: null,
		slot3: null,
		slot4: null,
		slot5: null,
		slot6: null,
		slot7: null,
		slot8: null,
		slot9: null,
		slot10: null,
		status: 0
	},
	orbFusionCrafting: {
		slot1: null,
		slot2: null,
		slot3: null,
		slot4: null,
		slot5: null,
		status: 0
	}
});
export const craftingLog = writable(null);
export const craftingStep = writable(1);
export const craftingStepFigure = writable(1);
export const waitingConfirmationCrafting = writable(false);
export const craftingResult = writable(null);
export const craftingResultFigure = writable(null);
export const now = writable(0);
export const cookieStatus = writable(true);
export const announcementSeen = writable(false);
export const partnerDrives = writable([]);
export const partnerStakedAssets = writable([]);
