<script>
	import { onMount } from 'svelte';
	import SnowStorm from 'src/lib/snowstorm';

	onMount(() => {
		let snowStorm = new SnowStorm(window, document);

		snowStorm.followMouse = false;
		snowStorm.useTwinkleEffect = false;
		snowStorm.snowStick = false;
		snowStorm.flakesMaxActive = 100;
		snowStorm.vMaxX = 1; // Maximum X velocity range for snow
		snowStorm.vMaxY = 3;
		snowStorm.flakeWidth = 100;
		snowStorm.flakeHeight = 100;
		snowStorm.snowflakeSizeMulti = 7;
		snowStorm.targetElement = 'mission-map';

		snowStorm.start();
	});
</script>
