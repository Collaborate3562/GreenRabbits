<script>
</script>

<!-- Trigger/Open The Modal -->
<!-- <button id="button" on:click={toggleModal}>Open Modal</button> -->

<!-- The Modal -->

<div class="modal">
	<div class="loader">
		<div class="square-spin">
			<div />
		</div>
	</div>
</div>

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
		background-color: rgba(0, 0, 0, 0.651);
	}
	.loader {
		display: flex;
		justify-content: center;
		align-items: middle;
	}
</style>
