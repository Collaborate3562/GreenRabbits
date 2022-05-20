<script>
	import Mission from 'src/components/mission/Mission.svelte';

	let screen = 'main';
</script>

<svelte:head>
	<title>Missions | GreenRabbit Game</title>
</svelte:head>

{#if screen == 'main'}
	<Mission />
{/if}
