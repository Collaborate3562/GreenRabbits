import { chain } from './chain';
import { createInitialTypes, SerialBuffer } from 'eosjs/dist/eosjs-serialize.js';
import { atomicAssetsApi } from './atomic.assets.api';
import {
	STAKING_CONTRACT,
	TOKEN_CONTRACT,
	TESTNET,
	PROMO_CONTRACT,
	STORE_CONTRACT,
	UNBOXING_CONTRACT,
	CRAFTING_CONTRACT,
	COLLECTION_NAME,
	MATS_CONTRACT,
	REDEEM_CONTRACT
} from './config';
import { dynamicSort, resolveAfterMS, resolveAfterSeconds } from './helpers';
const MINERALS = ['NANORE', 'FLORIA', 'SAP', 'VERSAT', 'SOL'];

const ACTIVE = 1;
const INACTIVE = 0;
const builtinTypes = createInitialTypes();

const typeUint128 = builtinTypes.get('uint128');
const typeName = builtinTypes.get('name');
const typeUint64 = builtinTypes.get('uint64');

function getUserAssetLower(name) {
	const buf = new SerialBuffer({
		textDecoder: new TextDecoder(),
		textEncoder: new TextEncoder()
	});

	buf.pushNumberAsUint64(0);
	buf.pushName(name);

	let val = typeUint128.deserialize(buf);

	return val;
}

function getUserAssetUpper(name) {
	const buf = new SerialBuffer({
		textDecoder: new TextDecoder(),
		textEncoder: new TextEncoder()
	});

	typeUint64.serialize(buf, '18446744073709551615');
	buf.pushName(name);

	let val = typeUint128.deserialize(buf);
	return val;
}
function getSalesLower(state = ACTIVE) {
	const buf = new SerialBuffer({
		textDecoder: new TextDecoder(),
		textEncoder: new TextEncoder()
	});

	buf.pushNumberAsUint64(0); // lowest uint64_t value
	buf.pushNumberAsUint64(state); // state of the sale

	let val = typeUint128.deserialize(buf);

	return val;
}

function getSalesUpper(state = ACTIVE) {
	const buf = new SerialBuffer({
		textDecoder: new TextDecoder(),
		textEncoder: new TextEncoder()
	});

	typeUint64.serialize(buf, '18446744073709551615'); // highest uint64_t value
	buf.pushNumberAsUint64(state); // state of the sale

	let val = typeUint128.deserialize(buf);
	return val;
}
async function fetchPoolAssets(activeUser, collections) {
	if (!collections || !collections[0].collection) return;

	if (!activeUser) return;

	let res = await atomicAssetsApi.getAssets(activeUser.accountName, collections[0].collection);

	if (res?.success) {
		// TODO: Figure out what can be staked, like flashdrives etc

		// This is a TEMP filter
		let assets = res.data.filter((a) => {
			if (a.schema.schema_name === 'flashdrive') return false;
			if (a.schema.schema_name === 'packs') return false;
			if (a.schema.schema_name === 'chests') return false;
			return true;
		});

		return assets;
	}
}

async function fetchAccount(activeUser) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: STAKING_CONTRACT,
		table: 'accounts',
		lower_bound: activeUser.accountName,
		upper_bound: activeUser.accountName
	});
	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return { user: activeUser.accountName, collected: '0.0000 SHELL' };
}

async function fetchCraftLog(activeUser) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: CRAFTING_CONTRACT,
		table: 'craftlogs',
		lower_bound: activeUser.accountName,
		upper_bound: activeUser.accountName
	});
	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return null;
}

async function fetchFusionOutcome(activeUser, scope = 'greenprint') {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope,
		table: 'fusions',
		lower_bound: activeUser,
		upper_bound: activeUser
	});
	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return null;
}
async function fetchBoostOutcome(activeUser) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: CRAFTING_CONTRACT,
		table: 'gpboosts',
		lower_bound: activeUser,
		upper_bound: activeUser
	});
	if (res?.rows?.length) {
		let result = res?.rows[0];
		const greenprintData = await atomicAssetsApi.getAssetsById([result.greenprint]);
		const orbData = await atomicAssetsApi.getAssetsById([result.orb]);
		result.greenprintData = greenprintData.data[0];
		result.orb = orbData.data[0];
		return result;
	}
	return null;
}
async function fetchFusionStats(activeUser) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: CRAFTING_CONTRACT,
		table: 'fusionlimits',
		lower_bound: activeUser,
		upper_bound: activeUser
	});
	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return null;
}
async function fetchFusionConfig() {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: CRAFTING_CONTRACT,
		table: 'config'
	});
	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return null;
}

async function fetchRedeemables() {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: REDEEM_CONTRACT,
		index_position: 1,
		json: true,
		limit: 100,
		scope: REDEEM_CONTRACT,
		table: 'redeemables'
	});
	if (res?.rows?.length) {
		return res?.rows;
	}
	return [];
}
async function fetchCraftingConfig() {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: CRAFTING_CONTRACT,
		table: 'config'
	});
	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return null;
}

async function fetchOutcomes(contract) {
	if (!contract) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position: 1,
		json: true,
		limit: 100,
		scope: contract,
		table: 'outcomes'
	});
	return res?.rows;
}
async function fetchSales(contract = STORE_CONTRACT, mock = null) {
	if (!contract) return;
	if (mock) return mock;
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position: 1,
		json: true,
		limit: 100,
		scope: contract,
		table: 'sale'
	});
	if (res) {
		return res?.rows;
	}
}
async function fetchWlSales(contract = STORE_CONTRACT, saleId, accountName) {
	if (!contract) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position: 1,
		json: true,
		limit: 100,
		scope: contract,
		table: 'wlsales',
		lower_bound: saleId,
		upper_bound: saleId
	});

	if (res?.rows[0]) {
		const wl_name = res?.rows[0].wl_name;
		const res2 = await checkWhitelist(STORE_CONTRACT, wl_name, accountName);
		return res2;
	}
}
async function checkWhitelist(contract = STORE_CONTRACT, wl_name, accountName) {
	if (!contract) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position: 1,
		json: true,
		limit: 100,
		scope: wl_name,
		table: 'whitelist',
		lower_bound: accountName,
		upper_bound: accountName
	});

	if (res?.rows[0]?.account == accountName) {
		return true;
	} else return false;
}

async function fetchSaleStats(saleId, activeUser, contract = STORE_CONTRACT) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position: 1,
		json: true,
		limit: 1,
		scope: activeUser.accountName,
		table: 'accstats',
		lower_bound: saleId,
		upper_bound: saleId
	});

	if (res?.rows[0]) {
		return res?.rows[0];
	}
	return { counter: 0, last_buy_time: 0 };
}
async function fetchBalance(activeUser) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: TOKEN_CONTRACT,
		index_position: 1,
		json: true,
		limit: 10,
		scope: activeUser.accountName,
		table: 'accounts'
	});
	let balance = 0.0;

	if (res?.rows?.length) {
		let shell = res.rows.find((acc) => acc.balance.includes('SHELL'));
		if (shell) {
			balance = (parseInt(shell.balance.split(' ')[0].replace('.', '')) / 10000).toFixed(2);
		} else {
			balance = 0.0;
		}
	} else {
		balance = 0.0;
	}

	return balance;
}

async function fetchWaxBalance(activeUser) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_currency_balance', {
		code: 'eosio.token',
		account: activeUser.accountName,
		symbol: 'WAX'
	});

	let balance = 0.0;

	if (res?.length) {
		let shell = res.find((acc) => acc.includes('WAX'));
		if (shell) {
			balance = (parseInt(shell.split(' ')[0].replace('.', '')) / 100000000).toFixed(4);
		} else {
			balance = 0.0;
		}
	} else {
		balance = 0.0;
	}

	return balance;
}
async function fetchPromoBalance(activeUser, collections) {
	if (!activeUser) return;
	let balances = [];
	for (let collection of collections) {
		const res = await fetchPromoCollectionBalance(activeUser, collection);
		balances.push({
			collection: collection.collection,
			balance: res
		});
	}
	return balances;
}

async function fetchPromoCollectionBalance(activeUser, collection) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: PROMO_CONTRACT,
		index_position: 1,
		json: true,
		limit: 10,
		scope: collection.collection,
		table: 'accounts',
		lower_bound: activeUser.accountName,
		upper_bound: activeUser.accountName
	});
	let ret = { balance: 0, staked: 0 };
	let balance = 0.0;

	if (res?.rows?.length) {
		let shell = res.rows.find((acc) => acc.collected.includes('SHELL'));
		if (shell) {
			ret.balance = (parseInt(shell.collected.split(' ')[0].replace('.', '')) / 10000).toFixed(2);
			ret.staked = shell.staked;
		} else {
			ret.balance = 0.0;
		}
	} else {
		ret.balance = 0.0;
	}

	return ret;
}

async function fetchCollections(contract = STAKING_CONTRACT) {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position: 1,
		json: true,
		limit: '100',
		scope: contract,
		table: 'collections'
	});

	let collections = res.rows;

	if (collections) {
		return collections;
	}
}

async function fetchDrives(activeUser, collections) {
	if (!collections) return;
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 2,
		key_type: 'i128',
		json: true,
		limit: '100',
		scope: collections[0].collection,
		table: 'drives',
		lower_bound: getUserAssetLower(activeUser.accountName),
		upper_bound: getUserAssetUpper(activeUser.accountName)
	});
	let drives = res?.rows;
	if (drives) {
		return drives;
	}
}
async function fetchDrivesFromCollection(activeUser, collection) {
	if (!collection) return;
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 2,
		key_type: 'i128',
		json: true,
		limit: '100',
		scope: collection,
		table: 'drives',
		lower_bound: getUserAssetLower(activeUser.accountName),
		upper_bound: getUserAssetUpper(activeUser.accountName)
	});
	let drives = res?.rows;
	if (drives) {
		return drives;
	}
}
async function fetchStorage(activeUser, pool) {
	if (!pool) return;

	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: pool[0].collection,
		table: 'storage',
		lower_bound: activeUser.accountName,
		upper_bound: activeUser.accountName
	});

	if (res?.rows?.length) {
		return res?.rows[0];
	}
	return [];
}

async function fetchAssets(activeUser) {
	if (!activeUser) return;

	let assets = [];
	let next = getUserAssetLower(activeUser.accountName);
	let hasMore = true;

	while (hasMore) {
		const res = await fetchAssetsPage(activeUser, next);
		if (res?.rows) {
			res.rows.forEach((element) => {
				assets.push(element);
			});

			hasMore = await res.more;
			next = await res.next_key;
		}
		await resolveAfterMS(100);
	}
	return assets;
}
async function fetchAssetsPage(activeUser, next) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 2,
		key_type: 'i128',
		json: true,
		limit: 200,
		scope: STAKING_CONTRACT,
		table: 'assets',
		lower_bound: next,
		upper_bound: getUserAssetUpper(activeUser.accountName)
	});

	return res;
}
async function fetchCraftOutcome(template_id) {
	if (!template_id) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: CRAFTING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: CRAFTING_CONTRACT,
		table: 'outcomes',
		lower_bound: template_id,
		upper_bound: template_id
	});
	let assets = res?.rows;
	if (assets) {
		return assets;
	}
}
async function fetchPromoPoolAssets(activeUser) {
	if (!activeUser) return;

	let assets = [];
	let next = getUserAssetLower(activeUser.accountName);
	let hasMore = true;

	while (hasMore) {
		const res = await fetchPromoPoolAssetsPage(activeUser, next);
		if (res?.rows) {
			res.rows.forEach((element) => {
				assets.push(element);
			});

			hasMore = await res.more;
			next = await res.next_key;
		}
		await resolveAfterMS(100);
	}
	return assets;
}
async function fetchPromoPoolAssetsPage(activeUser, next) {
	if (!activeUser) return;

	let res = await chain.post('/v1/chain/get_table_rows', {
		code: PROMO_CONTRACT,
		index_position: 2,
		key_type: 'i128',
		json: true,
		limit: 200,
		scope: PROMO_CONTRACT,
		table: 'assets',
		lower_bound: next,
		upper_bound: getUserAssetUpper(activeUser.accountName)
	});

	return res;
}
async function fetchWeights(STAKING_CONTRACT) {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 10,
		scope: STAKING_CONTRACT,
		table: 'weights'
	});
	let weights = res?.rows;
	if (weights) {
		return weights;
	}
}

async function fetchPoolDriveAssets(activeUser, collections) {
	if (!collections || !collections[0].collection) return;
	if (!activeUser) return;

	let res = await atomicAssetsApi.getAssets(
		activeUser.accountName,
		collections[0].collection,
		'flashdrive'
	);

	if (res?.success) {
		return res;
	}
}
async function fetchAllAssets(activeUser, collections) {
	if (!collections || !collections[0].collection) return;
	if (!activeUser) return;
	let collectionNameArray = [];
	collections.forEach((element) => {
		collectionNameArray.push(element.collection);
	});
	let userCollections = await atomicAssetsApi.getAccount(
		activeUser.accountName,
		collectionNameArray.join()
	);
	const total_asset_count = userCollections.data.assets;
	let hasMore = true;
	let page = 1;
	let result = {};
	result.data = [];
	while (hasMore) {
		let res = await atomicAssetsApi.getAssets(
			activeUser.accountName,
			collectionNameArray.join(),
			null,
			page
		);
		res.data.forEach((element) => {
			result.data.push(element);
		});
		if (result.data.length < total_asset_count) {
			hasMore = true;
			page++;
		} else {
			hasMore = false;
		}
		await resolveAfterMS(100);
	}

	return result;
}
async function fetchAtomicAssets(activeUser, collection) {
	if (!collection) return;
	if (!activeUser) return;

	let res = await atomicAssetsApi.getAssets(
		activeUser.accountName,
		collection.collection,
		collection.schema
	);

	if (res?.success) {
		return res;
	}
}
async function fetchOwnedByTemplate(activeUser, templateIds, collection) {
	if (!templateIds) return;
	if (!activeUser) return;

	let res = await atomicAssetsApi.getAssetsByTemplate(
		activeUser.accountName,
		templateIds,
		collection
	);

	if (res?.success) {
		return res;
	}
}
async function fetchPromos(activeUser, collections) {
	if (!activeUser) return;
	if (!collections) return;
	let response = [];

	for (let collection of collections) {
		const res = await fetchAtomicAssets(activeUser, collection);
		response.push({ collection: collection.collection, data: res.data });
	}

	return response;
}

async function checkTerms(activeUser) {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: STAKING_CONTRACT,
		index_position: 1,
		json: true,
		limit: 1,
		scope: STAKING_CONTRACT,
		table: 'terms',
		lower_bound: activeUser.accountName,
		upper_bound: activeUser.accountName
	});

	let terms = res?.rows;
	if (terms.length == 0) return false;
	if (terms[0].user == activeUser.accountName) return true;
	return false;
}
async function fetchClaims(id, scope = 'atomicpacksx') {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: scope,

		json: true,
		limit: 100,
		scope: String(id),
		table: 'unboxassets'
	});

	const claims = res?.rows;
	return claims;
}
async function fetchNeftyClaims(id, scope = 'atomicpacksx') {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: scope,
		index_position: 1,
		json: true,
		/* 	key_type: 'name', */
		limit: 200,
		lower_bound: id,
		reverse: false,
		scope,
		show_payer: false,
		table: 'claimassets',

		upper_bound: id
	});

	const claims = res?.rows;
	return claims;
}
async function fetchNotClaimed(activeUser, scope = 'atomicpoolsx', externalNames = []) {
	if (!activeUser.accountName) return;
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: scope,
		index_position: 2,
		json: true,
		key_type: 'name',
		limit: 1000,
		scope: scope,
		table: 'claims',
		lower_bound: activeUser.accountName,
		upper_bound: activeUser.accountName
	});

	const claims = res?.rows;
	const response = claims.filter((item) => {});
	return claims;
}

async function fetchPackConfig(contract = 'atomicpacksx', template_id) {
	if (!template_id) return;
	let index_position = 2;
	if (contract === 'atomicpacksx') index_position = 2;
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: contract,
		index_position,
		json: true,
		scope: contract,
		key_type: 'i64',
		table: 'packs',
		lower_bound: template_id,
		upper_bound: template_id
	});
	console.log('@config res', res);
	let config = res?.rows;

	if (config) return config;
	return false;
}

async function fetchChests(activeUser, collection) {
	if (!collection || !collection[0].collection) return;
	if (!activeUser) return;

	let res = await atomicAssetsApi.getAssets(
		activeUser.accountName,
		collection[0].collection,
		'chests'
	);

	if (res?.success) {
		return res;
	}
}

async function queryActiveSales() {
	try {
		let res = await chain.post('/v1/chain/get_table_rows', {
			code: STORE_CONTRACT,
			index_position: 3,
			key_type: 'i128',
			json: true,
			limit: 100,
			scope: STORE_CONTRACT,
			table: 'sale',
			lower_bound: getSalesLower(ACTIVE),
			upper_bound: getSalesUpper(ACTIVE)
		});

		return res;
	} catch (err) {
		console.log(err.response);

		console.log(JSON.stringify(err.response.data, null, 2));
	}
}

async function queryInactiveSales() {
	try {
		let res = await chain.post('/v1/chain/get_table_rows', {
			code: STORE_CONTRACT,
			index_position: 3,
			key_type: 'i128',
			json: true,
			limit: 100,
			scope: STORE_CONTRACT,
			table: 'sale',
			lower_bound: getSalesLower(INACTIVE),
			upper_bound: getSalesUpper(INACTIVE)
		});
		return res;
	} catch (err) {
		console.log(err.response);

		console.log(JSON.stringify(err.response.data, null, 2));
	}
}
/* async function getStoreItems() {
	let sales = [];
	const activeItems = await queryActiveSales();
	for (let item of activeItems.rows) {
		item.active = true;
		sales.push(item);
	}
	const inactiveItems = await queryInactiveSales();
	for (let item of inactiveItems.rows) {
		item.active = false;
		sales.push(item);
	}
	return sales;
} */
async function fetchShopData(activeUser, mock = false) {
	let sales = null;
	if (mock) sales = mock;
	else sales = await getStoreItems();
	var res = {};
	if (!sales) return [];
	for await (let sale of sales) {
		const templateData = await atomicAssetsApi.getTemplates(sale.collection, sale.itemtemplate);
		sale.templateData = templateData.data;
		if (activeUser.accountName) {
			const sales = await fetchSaleStats(sale.sale_id, activeUser);
			sale.userPurchased = sales;
			const owned = await atomicAssetsApi.getTemplatesOfUser(
				activeUser.accountName,
				sale.itemtemplate
			);
			sale.ownedAssets = owned;
			sale.user = activeUser.accountName;
			const assetsData = await greenRabbitApi.fetchOwnedByTemplate(
				activeUser,
				[sale.itemtemplate],
				sale.collection
			);
			sale.assetsData = assetsData.data;
		}
	}

	res.sales = sales;
	return res;
}

async function fetchOffers(id, page = 1) {
	let res = await atomicAssetsApi.getOffers(id, page);
	if (res?.success) {
		return res.data;
	}
}

async function getStoreItems() {
	let sales = [];
	const activeItems = await queryActiveSales();

	for (let item of activeItems.rows) {
		item.show = true;
		sales.push(item);
	}
	const inactiveItems = await queryInactiveSales();

	for (let item of inactiveItems.rows) {
		item.show = false;
		sales.push(item);
	}
	sales.sort(dynamicSort('weighting'));

	return sales;
}
async function fetchClaimsNefty(id, scope = 'atomicpacksx') {
	let res = await chain.post('/v1/chain/get_table_rows', {
		code: scope,
		index_position: 1,
		json: true,
		/* 	key_type: 'name', */
		limit: 200,
		lower_bound: id,
		reverse: false,
		scope,
		show_payer: false,
		table: 'claimassets',

		upper_bound: id
	});

	const claims = res?.rows;
	return claims;
}

async function getMaterialBalances(activeUser) {
	if (!activeUser?.accountName) {
		return;
	}

	try {
		let res = await chain.post('/v1/chain/get_table_rows', {
			code: TOKEN_CONTRACT,
			scope: activeUser.accountName,
			table: 'accounts',
			limit: 30,
			json: true
		});
		console.log('minerals', res);
		let mineralsData = {
			NANORE: 0,
			FLORIA: 0,
			SAP: 0,
			VERSAT: 0,
			SOL: 0
		};
		let minerals = res.rows.filter((row) => {
			let tokenParts = row.balance.split(' ');
			let symbol = tokenParts[1];
			return MINERALS.includes(symbol);
		});
		console.log('minerals2', minerals);
		for (let mineral of minerals) {
			let tokenParts = mineral.balance.split(' ');
			let symbol = tokenParts[1];
			let value = tokenParts[0];
			mineralsData[symbol] = Number(value);
		}

		return mineralsData;
	} catch (err) {
		console.log(err);
	}
}

async function getCharacters(activeUser) {
	if (!activeUser?.accountName) {
		return;
	}

	try {
		let assets = await atomicAssetsApi.getAssets(
			activeUser.accountName,
			COLLECTION_NAME,
			'foragers'
		);

		return assets.data;
	} catch (err) {
		console.log(err);
	}
}
async function getMissionSlots(activeUser) {
	if (!activeUser?.accountName) {
		return;
	}

	try {
		let res = await chain.post('/v1/chain/get_table_rows', {
			code: MATS_CONTRACT,
			scope: MATS_CONTRACT,
			table: 'missionslots',
			limit: 30,
			index_position: 2,
			key_type: 'i64',
			lower_bound: activeUser?.accountName,
			upper_bound: activeUser?.accountName,
			json: true
		});

		if (res?.rows) {
			return res.rows;
		}
	} catch (err) {
		console.log(err);
	}
}
async function getMissions() {
	try {
		let res = await chain.post('/v1/chain/get_table_rows', {
			code: MATS_CONTRACT,
			scope: MATS_CONTRACT,
			table: 'missions',
			limit: 30,
			json: true
		});

		if (res?.rows) {
			return res.rows;
		}
	} catch (err) {
		console.log(err);
	}
}
async function getMission(id) {
	try {
		let res = await chain.post('/v1/chain/get_table_rows', {
			code: MATS_CONTRACT,
			scope: MATS_CONTRACT,
			table: 'missions',
			limit: 1,
			json: true,
			upper_bound: id,
			lower_bound: id
		});

		if (res?.rows) {
			return res.rows[0];
		}
	} catch (err) {
		console.log(err);
	}
}
async function getOrbs(activeUser) {
	if (!activeUser?.accountName) {
		return;
	}

	try {
		let assets = await atomicAssetsApi.getAssets(
			COLLECTION_NAME,
			'artifacts',
			activeUser?.accountName
		);

		const orbs = assets.data.filter((asset) => asset.data.Class == 'Orb');

		return orbs;
	} catch (err) {
		console.log(err);
	}
}

export const greenRabbitApi = {
	fetchPoolAssets,
	fetchAccount,
	fetchBalance,
	fetchWaxBalance,
	fetchCollections,
	fetchDrives,
	fetchStorage,
	fetchAssets,
	fetchWeights,
	fetchPoolDriveAssets,
	checkTerms,
	fetchChests,
	fetchPromos,
	fetchPromoPoolAssets,
	fetchPromoBalance,
	fetchSales,
	fetchSaleStats,
	fetchOwnedByTemplate,
	fetchPackConfig,
	fetchClaims,
	fetchShopData,
	fetchNotClaimed,
	fetchAllAssets,
	fetchCraftLog,
	fetchCraftOutcome,
	fetchFusionOutcome,
	fetchBoostOutcome,
	fetchFusionStats,
	fetchOutcomes,
	fetchOffers,
	fetchClaimsNefty,
	fetchFusionConfig,
	getMaterialBalances,
	getCharacters,
	getMissionSlots,
	getMissions,
	getMission,
	getOrbs,
	fetchCraftingConfig,
	fetchDrivesFromCollection,
	fetchWlSales,
	fetchRedeemables
};
