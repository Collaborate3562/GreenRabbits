<script>
	export let title;
	export let text;
</script>

<div class="wrapper">
	<p class="title">{title}</p>
	<p class="text">
		{text}
	</p>
</div>

<style>
	.text {
	}
	.title {
		font-size: 24px;
		font-weight: 900;
		margin-bottom: 24px;
	}
	.wrapper {
		height: 100%;
		background-color: black;
	}
</style>
