export const IPFS_URL_ONE = 'https://gateway.pinata.cloud/ipfs/';
export const IPFS_URL_TWO = 'https://ipfs.io/ipfs/';
export const ATOMIC_ASSET_URL = 'https://wax.atomichub.io/explorer/asset/';

export const TOOLTIP_FAILURE_RATE = {
	title: 'Success rate',
	text:
		'This displays the base Shellinium cost that is required, in order to move forward with your crafting attempt. This amount will change based on the Rarity of the NFTs you are using for your craft attempt. Whether you succeed or fail, this base Shellinium will be consumed and will not be returned to you.'
};

export const TOOLTIP_SHELLINIUM = {
	title: 'Shellinium',
	text:
		'This displays the base Shellinium cost that you will incur should you be successful in the crafting attempt once you have selected your desired NFT(s) to craft with. Whether your attempt is successful or a failure, you will still incur this base Shellinium cost.'
};
export const TOOLTIP_SHELLINIUM_BOOST = {
	title: 'Shellinium',
	text:
		'This displays the base Shellinium cost that you will incur for your boosting attempt, once you have selected your desired NFTs to boost with. Regardless of outcome, this base Shellinium cost will not be returned and will be consumed by the process.'
};

export const TOOLTIP_SUCCESS_RATE = {
	title: 'Success rate',
	text:
		"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled"
};
export const TOOLTIP_POWER_COST = {
	title: 'SPU power cost',
	text:
		'As you progress into your second craft attempt of a 24 hour window and beyond, you will require additional crafting power that can be acquired through the leasing of a Shell Power Unit (SPU). This is not optional and is non-refundable. It will be dictated by both which attempt you are about to make within a 24 hour window as well as what NFT(s) were used in your previous craft attempt. Whether your attempt is successful or a failure, you will still incur this SPU cost.'
};

export const CRAFTING_STATE_INIT = {
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
};
export const STRENGTH_MAX = 450;
export const RESILIENCE_MAX = 450;
export const AGILITY_MAX = 400;
export const SPEED_MAX = 400;
export const LUCK_MAX = 45;
export const INTELLECT_MAX = 135;

export const tokens = {
	VERSAT: 'VERSATOPIUM',
	NANORE: 'NANORE',
	SAP: 'ELDER TREE SAP',
	FLORIA: 'FLORIA',
	SOL: 'SOLKENS',
	SHELL: 'SHELLINIUM'
};
