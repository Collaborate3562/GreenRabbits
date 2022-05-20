<script>
	export let onClick;
</script>

<div class="unclaimed_wrapper">
	<div class="unclaimed_banner" on:click={onClick}>
		YOU HAVE AN UNCLAIMED PACK. CLICK HERE TO CLAIM IT!
	</div>
</div>

<style>
	.unclaimed_wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 51px;
		margin-bottom: 20px;
		position: absolute;
		width: 100%;
		top: 67px;
	}

	.unclaimed_banner {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 464px;
		background: #d93b3b;
		border: solid 1px #ff9191;
		color: white;
		font-size: 14px;
		height: 42px;
		font-weight: bold;
		text-align: center;
		cursor: pointer;
	}

	@media (max-width: 1024px) {
		.unclaimed_banner {
			width: 90%;
			text-align: center;
			font-size: 11px;
		}
		.unclaimed_wrapper {
			width: 65%;
			top: 32px;
			right: 0;
		}
	}
</style>
