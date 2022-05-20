<script>
	import GreenPrintInventory from './GreenPrintInventory.svelte';
	export let hasForm = false;
	export let onCancel = () => {};
	export let onOkay = () => {};
	export let filterType;
	export let type;
	export let rarity;
	export let cardType;
	export let boosting;
	export let craftType;
	export let initialRarity;
	export let showAll = false;
	export let slot;
	export let inventoryType = 'crafting';
	export let maxSelectCount = 1;
	const types = {
		action: { name: 'T420 Art Action', id: 3, matcher: 'Action' },
		diorama: { name: 'T420 Art Diorama', id: 2, matcher: 'Diorama' },
		tablet: { name: 'Lore Tablet', id: 5, matcher: 'Lore Tablet' },
		coin: { name: 'T420 Art Coin', id: 4, matcher: 'Coin' },
		aux: { name: 'T420 Art Coin', id: 4, matcher: 'Coin' },
		figure: { name: '3D Figure', id: 6, matcher: 'Figure' },
		credit: { name: 'Credit', id: 6, matcher: 'Credit' },
		greenprint: { name: 'greenprint', id: 7, matcher: 'Greenprint' },
		artifacts: { name: 'artifacts', id: 8, matcher: 'Orb' }
	};
	const rarityTypes = {
		auxcomponent: { name: '3D Figure', id: 6, matcher: '4-Component' },
		figureCommon: { name: '3D Figure', id: 6, matcher: '3D Common' },
		figureUncommon: { name: '3D Figure', id: 6, matcher: '3D Uncommon' },
		figureEpic: { name: '3D Figure', id: 6, matcher: '3D Epic' },
		figureLegendary: { name: '3D Figure', id: 6, matcher: '3D Mythic' },
		figureMytic: { name: '3D Figure', id: 6, matcher: '3D Uncommon' },
		Common: { name: 'Common', id: 2, matcher: 'Common' },
		Uncommon: { name: 'Uncommon', id: 3, matcher: 'Uncommon' },
		Epic: { name: 'Epic', id: 4, matcher: 'Epic' },
		Legendary: { name: 'Legendary', id: 5, matcher: 'Legendary' },
		Mythic: { name: 'Mythic', id: 6, matcher: 'Mythic' },
		All: { name: 'All', id: 6, matcher: 'All' }
	};

	let selRarity, initRarity;
	selRarity = rarity ? rarityTypes[rarity] : null;
	initRarity = initialRarity ? rarityTypes[initialRarity] : null;
</script>

<GreenPrintInventory
	{maxSelectCount}
	selectedRarity={selRarity}
	selectedType={types[filterType]}
	initialRarity={selRarity}
	isCrafting
	{cardType}
	{inventoryType}
	{slot}
	{craftType}
	{onOkay}
	{boosting}
	{showAll}
/>
