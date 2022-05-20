<script>
	import { now } from 'src/stores/store';
	import { TESTNET } from 'src/utils/config';

	let activeSince = TESTNET ? 1636502873 : 1637539200;
	$: isActive = activeSince <= $now;
</script>

{#if isActive}
	<slot />
{/if}
