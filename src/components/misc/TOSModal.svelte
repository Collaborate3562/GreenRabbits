<script>
	import { browser } from '$app/env';
	import { activeUser, isDataLoading, loadingString, termsAccepted } from 'src/stores/store';
	import { STAKING_CONTRACT, TRANSACTION_TIMEOUT_MS } from 'src/utils/config';
	import { greenRabbitApi } from 'src/utils/green.rabbit.api';
	import { slide } from 'svelte/transition';
	import CtaButton from '../CTAButton.svelte';
	import Tos from './TOS.svelte';

	let showModal = true;
	export let title = '';
	export let maxWidth = '620px';
	export let maxHeight = '520px';

	export function toggleModal() {
		showModal = true;
	}
	function closeModal() {
		showModal = false;
	}
	$: {
		if (browser) {
			if (showModal) document.getElementsByTagName('body')[0].classList.add('stop-scrolling');
			else document.getElementsByTagName('body')[0].classList.remove('stop-scrolling');
		}
	}
	function disagree() {
		showModal = false;
		setTimeout(() => {
			window.logOut();
		}, 300);
	}
	let scrolledDown = false;
	const handleScroll = (e) => {
		const bottom = e.target.scrollHeight - e.target.scrollTop - 20 <= e.target.clientHeight;
		if (bottom) {
			scrolledDown = true;
		}
	};
	let loading = false;
	async function acceptTerms() {
		if (!$activeUser.accountName) return;

		loading = true;
		let transaction = {
			actions: [
				{
					account: STAKING_CONTRACT,
					name: 'acceptterms',
					authorization: [
						{
							actor: $activeUser.accountName,
							permission: $activeUser.requestPermission
						}
					],
					data: {
						user: $activeUser.accountName
					}
				}
			]
		};

		try {
			let res = await $activeUser.signTransaction(transaction, {
				broadcast: true,
				blocksBehind: 3,
				expireSeconds: 60
			});
			setTimeout(() => {
				$isDataLoading = true;
				$loadingString = 'Checking Terms';
				greenRabbitApi.checkTerms($activeUser).then((res) => {
					if (res) $termsAccepted = 'accepted';
					else $termsAccepted = 'notaccepted';
					loading = false;
					$isDataLoading = false;
				});
			}, TRANSACTION_TIMEOUT_MS);
		} catch (err) {
			window.pushToast(err.message, 'error', 'Transaction error', 6);
			loading = false;
		}
	}
</script>

<!-- Trigger/Open The Modal -->
<!-- <button id="button" on:click={toggleModal}>Open Modal</button> -->

<!-- The Modal -->
{#if showModal}
	<div class="wrapper">
		<div
			transition:slide
			id="modal"
			class="modal"
			style=" --maxWidth: {maxWidth}; --maxHeight:{maxHeight}"
		>
			<div class="blur" />
			<!-- Modal content -->
			<div class="modal-content">
				<div class="content" on:scroll={handleScroll}>
					<!-- <h1>Terms & Conditions</h1> -->

					<Tos />
				</div>
				<div class="cta-buttons">
					<div
						class="disagree-button"
						on:click={disagree}
						style="  margin: 0 4px;
					font-size: 20px;
					color: white;
					font-weight: 900;
					width: 160px;
					cursor:pointer;
					text-align: center;"
					>
						I DISAGREE
					</div>

					<CtaButton
						{loading}
						onClick={acceptTerms}
						disabled={!scrolledDown}
						text="i agree to the terms"
						fontSize="14px"
						width="180px"
					/>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		position: fixed;
		width: 100vw;
		height: 100vh;

		/* transition: all 0.3s ease; */
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999999;
		background-color: rgba(0, 0, 0, 0.85);
	}

	.content {
		color: white;
		padding: 0 22px 28px;
		max-width: 768px;
		margin: 0 auto;
		overflow: auto;
		height: 79%;
	}
	.cta-buttons {
		border-top: 3px solid var(--primary-teal);
		background-color: #000;
		height: 110px;
		position: sticky;
		bottom: 0;
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		margin-top: 22px;
		padding-top: 22px;
		padding-bottom: 22px;
	}
	.tos-wrapper {
		color: white;
		padding: 0 22px 28px;
	}

	.modal {
		display: block;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;

		z-index: 99;
		overflow: auto;
		background-color: rgb(0, 0, 0);
	}

	/* Modal Content */
	.modal-content {
		background-color: var(--pure-black);
		height: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 75px;
		padding: 0 18px;
	}

	/* The Close Button */

	.header h1 {
		font-size: 22px;
	}
	.header img {
		cursor: pointer;
		width: 24px;
	}

	@media (min-width: 1024px) {
		.content {
			max-width: 1024px;
		}
		.modal {
			width: 760px;
			height: 630px;
			margin: auto;
			border: 3px solid var(--primary-teal);
		}
	}
</style>
