<script>
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { lastPage, slideLeft } from 'src/stores/store';

	export let route = '';
	export let text;
	export let mobile;
	export let outgoing;
	export let active = $page.path.includes(route);
	$: {
		active = $page.path.includes(route);
	}
	export let first = false;
	export let wide = false;
</script>

<div
	on:click={() => {
		if (
			(route.includes('hub') && $page.path.includes('store')) ||
			($page.path.includes('hub') && route.includes('inventory'))
		) {
			/* NEED SOME KIND OF LOGIC TO PICK WHEN TO SLIDE WHERE */
			$slideLeft = true;
			goto(route);
			setTimeout(() => {
				$slideLeft = false;
			}, 200);
		} else {
			$slideLeft = false;
			goto(route);
		}
	}}
	class="link"
	style={first
		? 'margin-left:0px !important'
		: wide
		? 'margin-left:0px !important; margin-right:40px !important;'
		: ''}
	target={outgoing ? '_blank' : '_self'}
>
	<p
		class="unselectable"
		style="--border-color:{active ? 'rgba(54, 255, 192, 1)' : 'transparent'}; --height:{mobile
			? '15px'
			: '104px'}"
	>
		{text}
	</p>
</div>

<style>
	.link {
		margin-left: 0.5rem;
		margin-right: 0.5rem;
		font-family: Lato, ui-sans-serif;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		cursor: pointer;
	}
	p {
		font-size: 14px;

		font-weight: 900;
		line-height: 1.5rem;
		border-color: var(--border-color);
		border-style: solid;
		border-bottom-width: 4px;
		align-items: center;
		display: flex;
		margin: 0;
		height: var(--height);
		text-align: center;
	}
	p:hover {
		border-color: rgba(54, 255, 192, 1);
	}

	@media (min-width: 1180px) {
		.link {
			margin-left: 24px;
			margin-right: 24px;
		}
		p {
			font-size: 15px;
			line-height: 1.75rem;
		}
	}

	@media (min-width: 1450px) {
		p {
			font-size: 18px;
			line-height: 1.75rem;
		}
		.link {
			margin-left: 33px;
			margin-right: 33px;
		}
	}
</style>
