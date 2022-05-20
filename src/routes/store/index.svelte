<script>
	import { browser } from '$app/env';

	import Store from 'src/components/store/Store.svelte';
	import { accountStore, activeUser, storeLoaded, storeLoadingPercent } from 'src/stores/store';
	import { onMount } from 'svelte';

	$: showStore = $storeLoaded == true;
	onMount(() => {
		if (browser) {
			if (!$storeLoaded) {
				setTimeout(() => {
					window.getStoreData(false, () => {});
				}, 100);
			}
		}
	});
</script>

{#if showStore}
	<Store />
{:else}
	<div class="store-loader-wrap" style="margin-top: 19px; width: 200px; min-height: 30px">
		<div class="storage-bar-store">
			<div class="progress-done-store" style="width:{$storeLoadingPercent}%" />
		</div>
	</div>
{/if}

<style>
	.store-loader-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
	}
	.storage-bar-store {
		background-color: #2e2e2e;
		border-radius: 20px;
		position: relative;
		margin: 0 0 15px;
		height: 10px;
		width: 100%;
	}
	.progress-done-store {
		background: var(--primary-teal);
		box-shadow: 0 0 6px 0 #36ffc0;
		border-radius: 20px;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 0%;
		opacity: 1;
		transition: 0.3s ease 0.2s;
		margin: 0;
	}
</style>
