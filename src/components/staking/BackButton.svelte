<script>
	import { goto } from '$app/navigation';
	import { slideLeft } from 'src/stores/store';
	export let partner;
	export let disabled = false;
	export let text = '';
	export let width = '210px';

	export let fontSize = '14px';
	export let clearSelects = true;
	export let link = '/hub';
	export let onClick;
</script>

<div class="wrapper">
	<button
		style="--width: {width}; --font-size:{fontSize}"
		on:click={() => {
			if (onClick) onClick();
			clearSelects && window.clearSelects();
			$slideLeft = true;
			if (partner) goto(`/partner/${partner.slug}`);
			else goto(link);
			setTimeout(() => {
				$slideLeft = false;
			}, 200);
		}}
		class:disabled
		><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185.343 185.343">
			<defs />
			<path
				fill="#fff"
				d="M51.707 185.343a10.692 10.692 0 01-7.593-3.149 10.724 10.724 0 010-15.175l74.352-74.347L44.114 18.32c-4.194-4.194-4.194-10.987 0-15.175 4.194-4.194 10.987-4.194 15.18 0l81.934 81.934c4.194 4.194 4.194 10.987 0 15.175l-81.934 81.939a10.678 10.678 0 01-7.587 3.15z"
			/>
		</svg>
		{text}</button
	>
</div>

<style>
	.wrapper {
		position: absolute;
		top: calc(0px - 95px);
		left: 15px;
	}
	.wrapper svg {
		top: -1px;
		margin-right: 8px;
		position: relative;
		transform: rotate(180deg);
		width: 10px;
		height: 16px;
	}
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
		height: 50px;
		width: var(--width);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		background-color: black;
		font-size: var(--font-size);
		border: solid 1px var(--primary-teal);
		/* background-image: linear-gradient(to right, #44be98 3%, #20906d 84%); */
	}

	button:hover {
		background: linear-gradient(to right, #58d6af 3%, #46c19b 84%);
	}
	.disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	@media (min-width: 768px) {
		.wrapper {
			position: static;
		}
	}
</style>
