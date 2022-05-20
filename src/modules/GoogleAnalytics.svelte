<script>
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { activeUser } from 'src/stores/store';

	export let id;

	if (browser) {
		window.dataLayer = window.dataLayer || [];
		window.gtag = function gtag() {
			window.dataLayer.push(arguments);
		};
		window.gtag('js', new Date());
		window.gtag('config', id, { send_page_view: false });
	}

	$: {
		if (typeof gtag !== 'undefined') {
			window.gtag('config', id, {
				page_path: $page.path
			});
		}
	}
</script>

<svelte:head>
	<script async src="https://www.googletagmanager.com/gtag/js?id={id}"></script>
</svelte:head>
