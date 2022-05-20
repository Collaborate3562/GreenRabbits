import pRetry from 'p-retry';

const HTTP_REQUEST_TIMEOUT = 10000; // 10 seconds
const THIRTY_SECONDS = 30 * 1000;

const UNHEALTHY_CODES = [403, 502, 503, 504];

class NodeManager {
	nodes = [];
	fallbackNodes = [];

	constructor(nodes = [], fallbackNodes = []) {
		this.nodes = nodes.map((node) => {
			return {
				lastUsed: Date.now(),
				url: node,
				healthy: true // assume node is healthy to begin with
			};
		});
		this.fallbackNodes = fallbackNodes.map((node) => {
			return {
				lastUsed: Date.now(),
				url: node,
				healthy: true // assume node is healthy to begin with
			};
		});
	}

	async makeCall(url, options) {
		// Handle request timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), HTTP_REQUEST_TIMEOUT);

		const nodeUrl = this.getNodeUrl();
		const endpoint = `${nodeUrl}${url}`;
		let response;
		let error;

		// Make request to node
		try {
			response = await fetch(endpoint, {
				signal: controller.signal,
				keepalive: true,
				...options
			});
		} catch (err) {
			error = err;
		}

		// clear the http req timeout
		clearTimeout(timeoutId);

		// Handle Response Errors
		if ((response && !response.ok) || error) {
			if (response && !response.ok) {
				this.handleResponseError(response, nodeUrl);
				throw new Error(response.statusText);
			}
			if (error) {
				this.handleError(error, nodeUrl);
				// avoid bubbling up TypeError as they don't get retried
				// https://github.com/sindresorhus/p-retry#pretryinput-options
				throw new Error(error.message);
			}
			throw new Error('Unhandled error');
		}

		return response;
	}

	async fetch(url, options = {}) {
		const response = await pRetry(() => this.makeCall(url, options), {
			onFailedAttempt: (error) => {},
			retries: Math.max(5, this.nodes.length),
			// we don't really want exponential backoff
			// as they are seperate nodes, so factor of 1
			factor: 1,
			minTimeout: 100,
			maxTimeout: 500
		});
		return response;
	}

	getNodeUrl() {
		if (this.nodes.length > 1) {
			this.sortNodes();
		}

		// first nodes should be the last used nodes
		const node = this.nodes.find((n) => n.healthy);

		if (!node) {
			this.sortFallbackNodes();
			const fallbackNode = this.fallbackNodes.find((n) => n.healthy);
			this.tagFallbackNodeUsed(fallbackNode);
			return fallbackNode.url;
		}

		this.tagNodeUsed(node);
		return node.url;
	}

	tagNodeUsed(node) {
		this.nodes = this.nodes.map((n) => {
			if (n.url === node.url) {
				return {
					...n,
					lastUsed: Date.now()
				};
			}
			return n;
		});
	}

	tagFallbackNodeUsed(node) {
		this.fallbackNodes = this.fallbackNodes.map((n) => {
			if (n.url === node.url) {
				return {
					...n,
					lastUsed: Date.now()
				};
			}
			return n;
		});
	}

	handleResponseError(response, nodeUrl) {
		if (response.status === 429) {
			this.markRateLimited(nodeUrl);
			return;
		}

		if (UNHEALTHY_CODES.includes(response.status)) {
			this.markUnhealthy(nodeUrl);
			return;
		}

		// Do nothing?

		return;
	}

	handleError(error, nodeUrl) {
		if (error instanceof TypeError && isCorsError(error.message)) {
			this.markUnhealthy(nodeUrl);
			return;
		}

		// catch these type errors so we can fallback gracefully
		if (error instanceof TypeError) {
			this.markUnhealthy(nodeUrl);
			return;
		}

		// Handle other cases here
	}

	markUnhealthy(url) {
		this.nodes = this.nodes.map((node) => {
			if (node.url === url) {
				return {
					...node,
					healthy: false
				};
			}
			return node;
		});
	}

	markRateLimited(url) {
		this.nodes = this.nodes.map((node) => {
			if (node.url === url) {
				return {
					...node,
					lastUsed: Date.now() + THIRTY_SECONDS
				};
			}
			return node;
		});
	}

	sortNodes() {
		this.nodes = this.nodes.sort((a, b) => {
			return a.lastUsed - b.lastUsed;
		});
	}

	sortFallbackNodes() {
		this.fallbackNodes = this.fallbackNodes.sort((a, b) => {
			return a.lastUsed - b.lastUsed;
		});
	}
}

function isCorsError(errorMessage) {
	const corsErrors = ['Preflight response is not successful'];
	return corsErrors.includes(errorMessage);
}

export default NodeManager;
