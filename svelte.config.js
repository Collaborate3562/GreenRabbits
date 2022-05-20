import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';
import { resolve } from 'path';

const version_number = {
	version: process.env.npm_package_version,
	commit: process.env.VERCEL_GIT_COMMIT_SHA
		? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
		: 'dev',
	testnet: process.env.IS_TESTNET == 'true'
};
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#greenrabbit',
		vite: {
			mode: process.env.MODE || 'production',
			define: {
				version_number
			},
			resolve: {
				alias: {
					components: resolve('./src/components'),
					src: resolve('./src'),
					utils: resolve('./src/utils')
				}
			},
			optimizeDeps: {
				include: ['ual-anchor', 'ual-plainjs-renderer', '@eosdacio/ual-wax', 'eosjs', 'lodash']
			}
		},
		adapter: vercel()
	}
};

export default config;
