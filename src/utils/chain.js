import { WAX_NODES, FALLBACK_WAX_NODES } from './config';
import NodeManager from './node-manager';

const nodeManager = new NodeManager(WAX_NODES, FALLBACK_WAX_NODES);

const post = async (url, data) => {
	const response = await nodeManager.fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	return response.json();
};

export const chain = {
	post
};
