<script>
	import CTAButton from './CTAButton.svelte';
	let showModal = false;

	export function toggleModal() {
		document.documentElement.style.overflow = 'hidden';
		document.body.scroll = 'no';

		window.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});
		showModal = true;
	}
	function closeModal() {
		document.documentElement.style.overflow = 'scroll';
		document.body.scroll = 'yes';
		showModal = false;
	}

	let typeFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'T420 Art Diorama', id: 2, matcher: 'Diorama' },
		{ name: 'T420 Art Action', id: 3, matcher: 'Action' },
		{ name: 'T420 Art Coin', id: 4, matcher: 'Coin' },
		{ name: 'Lore Tablet', id: 5, matcher: 'Lore Tablet' },
		{ name: '3D Figure', id: 6, matcher: 'Figure' }
	];

	let shellFilter = [
		{ name: 'All', id: 1, min: 0, max: 0 },
		{ name: '1 - 499', id: 2, min: 1, max: 499 },
		{ name: '500 - 1,999', id: 3, min: 500, max: 1999 },
		{ name: '2000 - 9,999', id: 4, min: 2000, max: 9999 },
		{ name: '10,000 - 49,999', id: 5, min: 10000, max: 49999 },
		{ name: '50,000 - 99,999', id: 6, min: 50000, max: 99999 },
		{ name: '100,000+', id: 7, min: 100000, max: 0 }
	];

	let rarityFilter = [
		{ name: 'All', id: 1, matcher: 'All' },
		{ name: 'Common - 4 bits', id: 2, matcher: 'Common' },
		{ name: 'Uncommon - 16 bits', id: 3, matcher: 'Uncommon' },
		{ name: 'Epic - 64 bits', id: 4, matcher: 'Epic' },
		{ name: 'Legendary - 256 bits', id: 5, matcher: 'Legendary' },
		{ name: 'Mythic - 512 bits', id: 6, matcher: 'Mythic' }
	];

	export let raritySelected = rarityFilter[0];
	export let shellSelected = shellFilter[0];
	export let typeFilterSelected = typeFilter[0];
</script>

<!-- Trigger/Open The Modal -->
<!-- <button id="button" on:click={toggleModal}>Open Modal</button> -->

<!-- The Modal -->
<div id="modal" class="modal" style="--show:{showModal ? 'block' : 'none'}">
	<!-- Modal content -->
	<div class="modal-content">
		<div class="header">
			<h1>Filters</h1>
			<img on:click={closeModal} alt="Close button Cross" src="/assets/close.png" />
		</div>
		<div class="content">
			<h1 class="filter-header">Rarity</h1>

			{#each rarityFilter as { name, id }, idx}
				<div
					on:click={() => {
						raritySelected = rarityFilter[idx];
					}}
					class="filter-item {id === raritySelected.id && 'active'}"
				>
					{name}
				</div>
			{/each}

			<h1 class="filter-header" style="margin-top: 42px;">Shellinium /h range</h1>

			{#each shellFilter as { name, id }, idx}
				<div
					on:click={() => {
						shellSelected = shellFilter[idx];
					}}
					class="filter-item {id === shellSelected.id && 'active'}"
				>
					{name}
				</div>
			{/each}

			<!-- <h1 class="filter-header" style="margin-top: 42px;">Type</h1> -->

			<!-- {#each typeFilter as { name, id }, idx}
				<div
					on:click={() => {
						typeFilterSelected = typeFilter[idx];
					}}
					class="filter-item {id === typeFilterSelected.id && 'active'}"
				>
					{name}
				</div>
			{/each} -->
		</div>
		<div class="cta">
			<CTAButton
				outlined
				text="reset"
				onClick={() => {
					raritySelected = rarityFilter[0];
					shellSelected = shellFilter[0];
					typeFilterSelected = typeFilter[0];
				}}
				fontSize="14px"
				width="150px"
				height="50px"
			/>
			<CTAButton
				onClick={() => closeModal()}
				text="apply"
				fontSize="14px"
				width="150px"
				height="50px"
			/>
		</div>
		&nbsp;
	</div>
</div>

<style>
	.modal {
		display: var(--show);
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		z-index: 2001;
		background-color: rgb(0, 0, 0);
		overflow: auto;
		padding-bottom: 40px;
	}

	.modal-content {
		background-color: var(--pure-black);
		padding: 0 28px 28px 28px;
		height: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: sticky;
		top: 0;
		background-color: rgb(0, 0, 0);
		padding: 22px 0;
		margin-bottom: 22px;
	}
	.content {
		font-size: 16px;
		overflow-y: scroll;
	}

	.filter-item {
		display: flex;
		align-items: center;
		font-weight: bold;
		height: 50px;
		border-bottom: 1px solid rgb(255, 255, 255, 0.3);
		cursor: pointer;
	}
	.active {
		color: var(--primary-teal);
	}
	.content h1 {
		font-size: 18px;
		border-bottom: 1px solid var(--primary-teal);
		padding-bottom: 12px;
		margin-bottom: 0px;
	}
	.cta {
		display: flex;
		justify-content: space-around;
		margin: 52px auto 24px;
		max-width: 520px;
	}

	.header h1 {
		font-size: 22px;
	}
	.header img {
		cursor: pointer;
		width: 24px;
	}
</style>
