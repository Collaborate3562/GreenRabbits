<script>
	export let margin = 0;
</script>

<div class="wrapper" style="margin:{margin}px;">
	<div class="dot-carousel" />
</div>

<style>
	.wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100%;
	}
	/**
 * ==============================================
 * Dot Carousel
 * ==============================================
 */
	.dot-carousel {
		position: relative;
		left: -9999px;
		width: 5px;
		height: 5px;
		border-radius: 5px;
		background-color: var(--primary-teal);
		color: var(--primary-teal);
		box-shadow: 9984px 0 0 0 var(--primary-teal), 9999px 0 0 0 var(--primary-teal),
			10014px 0 0 0 var(--primary-teal);
		animation: dotCarousel 1.5s infinite linear;
	}
	@keyframes dotCarousel {
		0% {
			box-shadow: 9984px 0 0 -1px var(--primary-teal), 9999px 0 0 1px var(--primary-teal),
				10014px 0 0 -1px var(--primary-teal);
		}
		50% {
			box-shadow: 10014px 0 0 -1px var(--primary-teal), 9984px 0 0 -1px var(--primary-teal),
				9999px 0 0 1px var(--primary-teal);
		}
		100% {
			box-shadow: 9999px 0 0 1px var(--primary-teal), 10014px 0 0 -1px var(--primary-teal),
				9984px 0 0 -1px var(--primary-teal);
		}
	}
</style>
