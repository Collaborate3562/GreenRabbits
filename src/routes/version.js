import { env } from 'src/utils/variables';
export async function get({ params }) {
	// the `slug` parameter is available because this file
	// is called [slug].json.js

	return {
		body: {
			version: env.version,
			commit: env.commit
		}
	};
}
