<script>
	import ShowSuccessUnpack from '../store/ShowSuccessUnpack.svelte';

	let showModal = true;
	let showCards = false;
	let showUnpackSuccess = true;

	export let maxWidth = '620px';
	export let maxHeight = '520px';

	export function toggleModal() {
		window?.scrollTo(0, 0);
		showModal = true;
		document.getElementsByTagName('body')[0].classList.add('stop-scrolling');
	}
	function closeModal() {
		showModal = false;
		document.getElementsByTagName('body')[0].classList.remove('stop-scrolling');
	}
</script>

<!-- Trigger/Open The Modal -->
<!-- <button id="button" on:click={toggleModal}>Open Modal</button> -->

<!-- The Modal -->
<div
	id="modal"
	class="modal"
	style="--show:{showModal ? 'block' : 'none'}; --maxWidth: {maxWidth}; --maxHeight:{maxHeight}"
>
	<div class="blur" />
	<!-- Modal content -->
	<div class="modal-content">
		<div class="header">
			<!-- <img on:click={closeModal} alt="close icon" src="/assets/close.png" /> -->

			<img
				class="logo-img"
				alt="logo icon"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/v1626106905/GreenRabbit/gr_logo_g6i04r_qv8acp.png"
			/>
			<img
				class="logo-text"
				alt="green rabbit text icon"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/v1626106979/GreenRabbit/gr-logo-text_dehjat_ni71od.png"
			/>
		</div>

		<div class="content">
			{#if showUnpackSuccess}
				<ShowSuccessUnpack bind:showUnpackSuccess />
			{:else if !showCards}
				<div class="cta-open">
					<img
						alt="Pack"
						src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/Qmcx5gYseabrx8jiWNu3cXFmbzJKviRgqT7gLNK3X61Egx.png"
					/>
					<p>Click to open</p>
				</div>
			{:else}
				<div class="cards-wrapper">
					<!-- use "card"-div to show all the cards user unpacked -->
					<div class="card">
						<img
							alt="Pack"
							src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/Qmcx5gYseabrx8jiWNu3cXFmbzJKviRgqT7gLNK3X61Egx.png"
						/>
						<p>Card Name</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.logo-img {
		width: 40px;
		height: 25px;
		margin-right: 8px;
	}
	.logo-text {
		width: 230px;
		height: 25px;
	}
	.cards-wrapper {
		height: 340px;
		width: 285px;
		border: 3px solid var(--primary-teal);
		padding: -20px;

		font-weight: 900;
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.cta-open {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.cta-open img {
		margin-bottom: 24px;
		height: 340px;
		width: 285px;
	}
	.modal {
		display: var(--show);
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;

		z-index: 99;
		overflow: auto;
		background-color: rgb(0, 0, 0);
		background-color: rgba(0, 0, 0, 0.4);
	}

	/* Modal Content */
	.modal-content {
		background-color: var(--pure-black);

		height: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 75px;
		padding: 0 18px;
	}

	/* The Close Button */

	.header h1 {
		font-size: 22px;
	}

	.content {
		display: flex;
		height: 85%;
		justify-content: center;
		align-items: center;
	}
	@media (min-width: 1024px) {
		.blur {
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			z-index: -1;
			background: rgba(0, 0, 0, 0.7);
		}

		.cards-wrapper {
			height: 350px;
			width: 560px;
			border: 3px solid var(--primary-teal);
			padding: -20px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 900;
		}

		.card img {
			width: 435px;
			height: 520px;
		}
		/* .modal {
			width: var(--maxWidth);
			height: var(--maxHeight);
			margin: auto;
			border: 3px solid var(--primary-teal);
		} */
	}
</style>
