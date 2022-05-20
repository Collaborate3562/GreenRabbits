import { text } from 'svelte/internal';
import { TESTNET, ATOMIC_NODES } from './config';
import NodeManager from './node-manager';

const nodeManager = new NodeManager(ATOMIC_NODES);

const getAssets = async (accountName, collection, schema, page) => {
	console.log('getassets', accountName);
	let extraCollection = '';
	if (TESTNET) extraCollection = 'docproftest1,';
	if (!page) page = 1;
	var endpoint = `/v1/assets?owner=${accountName}&collection_name=${extraCollection}${collection}&page=${page}&limit=1000&order=desc&sort=asset_id`;
	if (schema)
		endpoint = `/v1/assets?owner=${accountName}&collection_name=${collection}&schema_name=${schema}&page=${page}&limit=1500&order=desc&sort=asset_id`;

	const response = await nodeManager.fetch(endpoint);

	return response.json();
};
const getTemplatesOfUser = async (accountName, templateId) => {
	const endpoint = `/v1/accounts?match=${accountName}&template_id=${templateId}&limit=1500&order=desc&sort=asset_id`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getTemplates = async (collection, template) => {
	const endpoint = `/v1/templates/${collection}/${template}`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getAccount = async (account, collection) => {
	const endpoint = `/v1/accounts/${account}?collection_whitelist=${collection}`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getAssetsByTemplate = async (accountName, templateIds, collection = 'greenrabbit') => {
	const endpoint = `/v1/assets?owner=${accountName}&collection_name=${collection}&template_id=${templateIds.join()}&last_update_refresh=0&page=1`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getAssetsByTemplateID = async (accountName, collection, templateIds) => {
	const endpoint = `/v1/assets?limit=1&page=1&order=desc&sort=created&burned=false&collection_name=${collection}&template_id=${templateIds.join()}&owner=${accountName}`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getAssetsById = async (ids) => {
	const endpoint = `/v1/assets?ids=${ids.join()},-100`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getAssetsByIdAndCollection = async (ids, collection = null) => {
	const endpoint = `/v1/assets?ids=${ids.join()},-100${
		collection ? '&collection_name=' + collection : ''
	}`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};

const getTemplatesById = async (ids) => {
	const endpoint = `/v1/templates?ids=${ids.join()}`;

	const response = await nodeManager.fetch(endpoint);
	return response.json();
};
const getTimestamp = async () => {
	const endpoint = 'https://wax.api.atomicassets.io/eosio-contract-api/timestamp';
	const response = await fetch(endpoint);
	return response.json();
};

const getOffers = async (id, page = 1) => {
	if (!page) page = 1;
	var endpoint = `https://wax.api.atomicassets.io/atomicmarket/v1/sales?collection_name=greenrabbit&state=1${
		id ? '&asset_id=' + id : ''
	}&page=${page}&limit=21&order=desc&sort=asset_id`;
	const response = await fetch(endpoint);
	return response.json();
};

const getOffersPost = async (
	id = null,
	page = 1,
	rarity = null,
	type = null,
	name = null,
	sort
) => {
	var bodyData = {};
	bodyData.collection_name = 'greenrabbit';
	if (rarity) bodyData['data:text.Rarity'] = rarity;
	if (type) {
		if (type.includes('_')) {
			const schema = type.substr(1);
			bodyData['schema_name'] = schema;
		} else {
			bodyData['data:text.Class'] = type;
		}
	}
	if (id) bodyData.asset_id = id;
	if (name) bodyData.match = name;
	bodyData.max_assets = '1';
	bodyData.limit = '21';
	bodyData.order = sort.order;
	bodyData.page = String(page);
	bodyData.sort = sort.sort;
	bodyData.state = '1';

	const response = await fetch('https://atomic.ledgerwise.io/atomicmarket/v1/sales', {
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-site'
		},

		body: JSON.stringify(bodyData),
		method: 'POST',
		mode: 'cors'
	});
	const data = await response.json();
	return data.data;
};
export const atomicAssetsApi = {
	getAssets,
	getTemplates,
	getTemplatesOfUser,
	getAssetsByTemplate,
	getAssetsById,
	getTimestamp,
	getAssetsByTemplateID,
	getTemplatesById,
	getAccount,
	getOffers,
	getAssetsByIdAndCollection,
	getOffersPost
};
