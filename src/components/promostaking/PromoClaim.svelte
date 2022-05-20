<script>
	export let disabled = false;
</script>

<button class:disabled>CLAIM IN 59:59</button>

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

		padding: 14px;
		height: 50px;
		width: 145px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		margin-left: auto;
		font-size: 14px;
		border: solid 1px #36ffc0;

		background-image: linear-gradient(
			to right,
			rgba(68, 190, 152, 0.3) 3%,
			rgba(32, 144, 109, 0.3) 84%
		);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
