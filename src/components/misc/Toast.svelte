<script>
	import { onMount } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	let toasts = [];

	let toastId = 0;
	const toastTypes = {
		error: {
			color: '#3b1b1b',
			icon: '/icons/error-icon.svg'
		},
		success: {
			color: '#177155',
			icon: '/icons/success-icon.svg'
		},
		warn: {
			color: '#6a612d',
			icon: '/icons/warn-icon.svg'
		},
		info: {
			color: '#175571',
			icon: '/icons/info-icon.svg'
		}
	};

	const pushToast = (msg = '', type = 'info', title = '', duration) => {
		// Handle adding better wording to the annoying chain permissions error
		if (
			msg.includes('transaction declares authority') &&
			msg.includes('does not have signatures for it under a provided delay')
		) {
			msg =
				'An unexpected error occured with the blockchain node, please close any transaction confirmation windows and try again';
		}

		const toastType = toastTypes[type] || toastTypes.info;
		const newToast = {
			_id: ++toastId,
			msg,
			icon: toastType.icon,
			toast_color: toastType.color,
			title: title.startsWith('#') ? '' : title,
			duration: parseInt(duration) || null
		};

		toasts = [...toasts, newToast];

		if (newToast.duration) {
			setTimeout(() => {
				closeToast(newToast._id);
			}, newToast.duration * 1000);
		}
	};

	const closeToast = (id) => {
		toasts = toasts.filter((a) => a._id !== id);
	};

	onMount(() => {
		window.pushToast = pushToast;
	});
</script>

<div class="toast-wrapper">
	{#each toasts as toast (toast._id)}
		<div
			class="toast-item"
			style="background-color: {toast.toast_color}"
			in:fly={{ delay: 0, duration: 300, x: 50, y: 0, opacity: 0.1, easing: backOut }}
			out:slide={{ duration: 500 }}
		>
			<div class="c-flex">
				<div class="p-2">
					<img class="toast-icon-img" src={toast.icon} alt="" />
				</div>
				<div class="p-2">
					{#if toast.title}<div class="toast-title">{toast.title}</div>{/if}
					<div class="toast-msg">{toast.msg}</div>
				</div>
			</div>
			<div class="toast-close" on:click={() => closeToast(toast._id)}>
				<i class="fa fa-times" />
			</div>
			{#if toast.duration}<div
					class="toast-loading"
					style="animation-duration: {toast.duration}s; background-color: {toast.toast_color}; background-image: linear-gradient(to right, {toast.toast_color}, white);"
				/>{/if}
		</div>
	{/each}
</div>

<style>
	.d-flex {
		display: -ms-flexbox;
		display: flex;
	}
	.c-flex {
		display: -ms-flexbox;
		display: flex;
		align-items: center;
	}
	.p-2 {
		padding: 0.4rem !important;
	}
	.mr-auto,
	.mx-auto {
		margin-right: auto !important;
	}
	.toast-wrapper {
		position: fixed;
		text-align: right;
		z-index: 999999999;
		min-width: 293px;
		top: 115px;
		right: 16px;
		transition: all 2s;
	}
	.toast-item {
		padding: 10px 10px;
		margin: 10px auto;
		max-width: 480px;
		position: relative;
		color: #fff;
	}
	.toast-close {
		position: absolute;
		top: 2px;
		right: 5px;
		font-size: 1em;
		cursor: pointer;
	}
	.toast-icon-img {
		height: 45px;
		width: auto;
		max-width: fit-content !important;
	}
	.toast-title {
		font-weight: 600;
		text-align: left;
	}
	.toast-msg {
		text-align: left;
		font-weight: 500;
		word-break: break-all;
		line-break: auto;
		color: #ccc;
	}
	.toast-loading {
		position: absolute;
		bottom: 0;
		height: 5px;
		left: 0;
		border-radius: 2px;
		animation-name: toast;
		animation-timing-function: linear;
	}
	@keyframes toast {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
</style>
