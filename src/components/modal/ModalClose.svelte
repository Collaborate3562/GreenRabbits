<script>
	export let disabled = false;
</script>

<button class:disabled>CLOSE</button>

<style>
	button {
		/* REMOVE DEFAULT STYLE */
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;

		/* NEW STYLE */
		margin: 0 auto;
		padding: 14px;
		height: 45px;
		width: 250px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;

		font-size: 14px;
		border: solid 1px var(--primary-teal);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
