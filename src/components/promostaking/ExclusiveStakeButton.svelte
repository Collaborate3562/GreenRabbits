<script>
	import { goto } from '$app/navigation';

	export let disabled = false;
</script>

<button
	class:disabled
	on:click={() => {
		goto('/exclusive');
	}}>STAKE EXCLUSIVES</button
>

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
		margin: 0 0 0 auto;
		padding: 14px;
		height: 50px;
		width: 145px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		white-space: nowrap;

		font-size: 14px;
		font-weight: 900;
		border: solid 1px #36ffc0;

		background-image: linear-gradient(to right, #44be98 3%, #20906d 84%);
	}

	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
