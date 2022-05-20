<!-- v1.0.0 -->
<script context="module">
	export function bind(Component, props = {}) {
		return function ModalComponent(options) {
			return new Component({
				...options,
				props: {
					...props,
					...options.props
				}
			});
		};
	}
</script>

<script>
	import * as svelte from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { browser } from '$app/env';
	import { inventoryOpen } from 'src/stores/store';

	const dispatch = createEventDispatcher();

	const baseSetContext = svelte.setContext;

	export let show = null;
	export let key = 'notsimple-modal';
	export let closeButton = true;
	export let closeOnEsc = true;
	export let closeOnOuterClick = true;
	export let styleBg = {};
	export let styleWindowWrap = {};
	export let styleWindow = {};
	export let styleContent = {};
	export let styleCloseButton = {};
	export let setContext = baseSetContext;
	export let transitionBg = fade;
	export let transitionBgProps = { duration: 150 };
	export let transitionWindow = slide;
	export let transitionWindowProps = transitionBgProps;

	const defaultState = {
		closeButton,
		closeOnEsc,
		closeOnOuterClick,
		styleBg,
		styleWindowWrap,
		styleWindow,
		styleContent,
		styleCloseButton,
		transitionBg,
		transitionBgProps,
		transitionWindow,
		transitionWindowProps
	};
	let state = { ...defaultState };

	let Component = null;

	let background;
	let wrap;
	let modalWindow;
	let scrollY;
	let cssBg;
	let cssWindowWrap;
	let cssWindow;
	let cssContent;
	let cssCloseButton;
	let currentTransitionBg;
	let currentTransitionWindow;
	let prevBodyPosition;
	let prevBodyOverflow;
	let outerClickTarget;

	const camelCaseToDash = (str) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

	const toCssString = (props) =>
		props
			? Object.keys(props).reduce(
					(str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`,
					''
			  )
			: '';

	const isFunction = (f) => !!(f && f.constructor && f.call && f.apply);

	const updateStyleTransition = () => {
		cssBg = toCssString(
			Object.assign(
				{},
				{
					width: window.innerWidth,
					height: window.innerHeight
				},
				state.styleBg
			)
		);
		cssWindowWrap = toCssString(state.styleWindowWrap);
		cssWindow = toCssString(state.styleWindow);
		cssContent = toCssString(state.styleContent);
		cssCloseButton = toCssString(state.styleCloseButton);
		currentTransitionBg = state.transitionBg;
		currentTransitionWindow = state.transitionWindow;
	};

	const toVoid = () => {};
	let onOpen = toVoid;
	let onClose = toVoid;
	let onOpened = toVoid;
	let onClosed = toVoid;

	const openInventory = (NewComponent, newProps = {}, options = {}, callback = {}) => {
		Component = bind(NewComponent, newProps);
		state = { ...defaultState, ...options };

		updateStyleTransition();
		disableScroll();

		(onOpen = (event) => {
			if (callback.onOpen) callback.onOpen(event);
			dispatch('open');
			dispatch('opening'); // Deprecated. Do not use!
		}),
			(onClose = (event) => {
				if (callback.onClose) callback.onClose(event);
				dispatch('close');
				dispatch('closing'); // Deprecated. Do not use!
			}),
			(onOpened = (event) => {
				if (callback.onOpened) callback.onOpened(event);

				dispatch('opened');
			});
		onClosed = (event) => {
			if (callback.onClosed) callback.onClosed(event);

			dispatch('closed');
		};
	};

	const closeInventory = (callback = {}) => {
		onClose = callback.onClose || onClose;
		onClosed = callback.onClosed || onClosed;
		Component = null;

		enableScroll();
	};

	const handleKeydown = (event) => {
		if (state.closeOnEsc && Component && event.key === 'Escape') {
			event.preventDefault();
			closeInventory();
		}

		if (Component && event.key === 'Tab') {
			// trap focus
			const nodes = modalWindow.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && event.shiftKey) index = 0;

			index += tabbable.length + (event.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			event.preventDefault();
		}
	};

	const handleOuterMousedown = (event) => {
		if (state.closeOnOuterClick && (event.target === background || event.target === wrap))
			outerClickTarget = event.target;
	};

	const handleOuterMouseup = (event) => {
		if (state.closeOnOuterClick && event.target === outerClickTarget) {
			event.preventDefault();
			closeInventory();
		}
	};

	const disableScroll = () => {
		document.body.style.overflowY = 'hidden';
	};

	const enableScroll = () => {
		document.body.style = {};
	};

	setContext(key, { openInventory, closeInventory });

	let isMounted = false;

	$: {
		if (isMounted) {
			if (isFunction(show)) {
				openInventory(show);
			} else {
				closeInventory();
			}
		}
	}

	svelte.onDestroy(() => {
		if (isMounted) {
			closeInventory();
		}
	});

	svelte.onMount(() => {
		isMounted = true;
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if Component}
	<div
		class="bg"
		on:mousedown={handleOuterMousedown}
		on:mouseup={handleOuterMouseup}
		bind:this={background}
		transition:currentTransitionBg={state.transitionBgProps}
		style="	position: fixed;
		z-index: 20;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.836);"
	>
		<div class="window-wrap" bind:this={wrap} style={cssWindowWrap}>
			<div
				class="window"
				role="dialog"
				aria-modal="true"
				bind:this={modalWindow}
				transition:currentTransitionWindow={state.transitionWindowProps}
				on:introstart={onOpen}
				on:outrostart={onClose}
				on:introend={onOpened}
				on:outroend={onClosed}
				style={cssWindow}
			>
				{#if state.closeButton}
					{#if isFunction(state.closeButton)}
						<svelte:component this={state.closeButton} onClose={closeInventory} />
					{:else}
						<button on:click={closeInventory} class="close" style={cssCloseButton} />
					{/if}
				{/if}
				<div class="content" style={cssContent}>
					<svelte:component this={Component} />
				</div>
			</div>
		</div>
	</div>
{/if}
<slot />

<style>
	.window-wrap {
		width: 100%;
		max-width: 100vw;
		margin: 0;
	}
	@media (max-width: 1023px) {
		* {
			box-sizing: border-box;
		}

		.bg {
			position: fixed;
			z-index: 999999;
			top: 0;
			left: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 100vw;
			height: 100vh;
			background: rgba(0, 0, 0, 0.836);
		}

		.window-wrap {
			position: relative;
			width: 100%;
			max-width: 100vw;
			margin: 0;
		}

		.window {
			position: relative;
			width: 800px;
			max-width: 100%;
			max-height: 100%;
			margin: 2rem auto;
			color: white;

			background: black;
			border: 3px solid var(--primary-teal);
		}

		.content {
			position: relative;
			padding: 1rem;
			max-height: calc(100vh - 4rem);
			overflow: auto;
		}

		.close {
			display: block;
			box-sizing: border-box;
			position: absolute;
			z-index: 1000;
			top: 1.5rem;
			right: 1.5rem;
			margin: 0;
			padding: 0;
			width: 29px;
			height: 29px;
			border: 0;
			color: black;
			border-radius: 1.5rem;
			background: url('/assets/close.png');
			background-size: contain;
			box-shadow: 0 0 0 1px black;
			transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
				background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
			-webkit-appearance: none;
		}

		/* 	.close:before,
	.close:after {
		content: '';
		display: block;
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		width: 1rem;
		height: 1px;
		background: black;
		transform-origin: center;
		transition: height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
			background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
	}

	.close:before {
		-webkit-transform: translate(0, -50%) rotate(45deg);
		-moz-transform: translate(0, -50%) rotate(45deg);
		transform: translate(0, -50%) rotate(45deg);
		left: 0.25rem;
	} */

		/* 	.close:after {
		-webkit-transform: translate(0, -50%) rotate(-45deg);
		-moz-transform: translate(0, -50%) rotate(-45deg);
		transform: translate(0, -50%) rotate(-45deg);
		left: 0.25rem;
	} */

		.close:hover {
			cursor: pointer;
		}

		.close:hover:before,
		.close:hover:after {
			height: 2px;
			background: white;
		}

		.close:focus {
			border-color: var(--primary-teal);
			box-shadow: 0 0 0 2px var(--primary-teal);
		}

		.close:active {
			transform: scale(0.9);
		}

		.close:hover,
		.close:focus,
		.close:active {
			outline: none;
		}
	}

	@media (min-width: 1024px) {
		.close {
			display: none;
		}
	}
</style>
