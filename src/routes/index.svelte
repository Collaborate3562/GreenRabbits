<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { activeUser } from '../stores/store.js';
	$: {
		if ($activeUser.accountName) goto('/hub');
	}
</script>
