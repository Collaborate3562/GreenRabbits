<script>
	export let showModal;
	export let title = '';
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
{#if showModal}
	<div
		id="modal"
		class="modal"
		style="--show:{showModal ? 'block' : 'none'}; --maxWidth: {maxWidth}; --maxHeight:{maxHeight}"
	>
		<div class="blur" />
		<!-- Modal content -->
		<div class="modal-content">
			<div class="header">
				<h1>{title}</h1>
				<img on:click={closeModal} alt="close icon" src="/assets/close.png" />
			</div>
			<div class="content">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		display: block;
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
		justify-content: space-between;
		height: 75px;
		padding: 0 18px;
	}

	/* The Close Button */

	.header h1 {
		font-size: 22px;
	}
	.header img {
		cursor: pointer;
		width: 24px;
	}

	.content {
		display: flex;
		height: 85%;
		justify-content: center;
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
		.modal {
			width: var(--maxWidth);
			height: var(--maxHeight);
			margin: auto;
			border: 3px solid var(--primary-teal);
		}
	}
</style>
