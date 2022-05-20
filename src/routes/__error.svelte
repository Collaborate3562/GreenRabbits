<script context="module">
	export const load = ({ error, status }) => {
		return {
			props: {
				error,
				status
			}
		};
	};
</script>

<script>
	export let status;
	export let error;
	import ErrorPage from 'src/components/misc/ErrorPage.svelte';
	console.log(status, error);
</script>

<ErrorPage {status} />

<style>
</style>
