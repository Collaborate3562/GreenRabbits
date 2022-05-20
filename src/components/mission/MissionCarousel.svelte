<script>
	import '@splidejs/splide/dist/css/splide.min.css';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';

	import { onMount } from 'svelte';

	import MissionCard from './MissionCard.svelte';

	export let missions = [];
	export let character;
	export let selectedIndex;
	export let onCardClick = () => {};

	let slider;

	onMount(() => {
		return () => {};
	});

	export function left() {
		slider.splide.go('<');
	}

	export function right() {
		slider.splide.go('>');
	}

	export function go(index) {
		slider.splide.go(index);
	}

	function isMissionLocked(character, mission) {
		// Lock mission if character's type isn't allowed
		if (!mission?.allowed_types.includes(character?.data?.Type)) {
			return true;
		}

		return (character?.data?.Level || 1) < mission?.level_requirement;
	}
</script>

<Splide
	bind:this={slider}
	options={{
		pagination: false,
		arrows: false,
		perPage: 4,
		gap: 10,
		breakpoints: {
			600: {
				perPage: 1
			},
			1000: {
				perPage: 2
			},
			1200: {
				perPage: 3
			},
			1440: {
				perPage: 4
			}
		}
	}}
>
	<!-- Left Arrow Control -->
	<div class="" slot="before-track">
		<button class="left" on:click={left} aria-label="left">
			<slot name="left-control" />
		</button>
	</div>

	<!-- Right Arrow Control -->
	<div class="" slot="after-track">
		<button class="right" on:click={right} aria-label="right">
			<slot name="right-control" />
		</button>
	</div>

	{#each missions as mission, index}
		<SplideSlide>
			<div class="mission-wrap">
				<MissionCard
					{character}
					index={mission?.pin?.index}
					active={mission?.pin?.index == selectedIndex}
					{mission}
					onClick={onCardClick.bind(null, mission, index)}
					locked={isMissionLocked(character, mission)}
				/>
			</div>
		</SplideSlide>
	{/each}
</Splide>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;

		position: absolute;
		min-width: 40px;
		height: 40px;
		top: 50%;
		z-index: 50;
		margin-top: -20px;
		border: none;
		background-color: transparent;
	}

	button:focus {
		outline: none;
	}

	.left {
		left: 3vw;
	}

	.right {
		right: 3vw;
	}

	.mission-wrap {
		cursor: grab;
	}
</style>
