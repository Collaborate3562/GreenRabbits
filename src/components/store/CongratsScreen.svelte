<script>
	import CtaButton from '../CTAButton.svelte';
	import Modal from '../Modal.svelte';
	export let maxRarity;
	export let onClose;
	export let onGoToInventory;
	export let rng;
	export let isRefreshing;
	const messages = [
		[
			'Commons, everybody has them.',
			'Not a bad place to build from. Nice work!',
			'There is always room in the market for some of those. Nice job!',
			'Nice! More staking power is always welcome.',
			'Have you seen your wallet? It’s full of cool things. Keep it up!'
		],
		[
			'Hey! At least it isn’t a common. Keep at it!',
			'Common who?',
			'You forgot to rub your rabbits’ foot, didn’t you?',
			'You’ve been sunk by the Sanyika Curse.',
			'Oh yeah! That’ll stake.'
		],
		[
			'Sweet, rare! How is the air up there?',
			'It may not be a pair of green tighties but love that rare!',
			'Put that rare in the air and shake it like you just don’t care.',
			'Congrats! You don’t find a rare like that every day.',
			'It’s no Mona Lisa, but that beauty is rare.'
		],
		[
			'Well, isn’t that just EPIC!',
			'Might not be a whale move, but sure could be a dolphin.',
			'YES! Who’s your daddy?',
			'Pr0ph3ticRabbit pr0ph3cized this moment.',
			'Wow, you may want to buy a lottery ticket.'
		],
		[
			'Oooooo… shiny',
			'Hey, this is Green Rabbit, not green leprechaun!',
			'LFG!! Some extra gold for your wallet.',
			'Damnnnn! You’re going to need to flex that new hype.',
			'With a pull like that, you must have a golden horde member.'
		],
		[
			'Forget horseshoe luck, you have the whole horse in your wormhole.',
			'Looks like you’re starting to whale now.',
			'Wow, crazy luck! Give your rabbits’ foot a break.',
			'Guess you can cross that mythic off your bucket list.',
			'Insane pull! Mad respect.'
		]
	];
</script>

<div id="modal" class="modal" style="--show:'block'; --maxWidth: 558px; --maxHeight:350px">
	<div class="blur" />
	<!-- Modal content -->
	<div class="modal-content">
		<div class="wrapper">
			<div class="flexwrapper">
				<span>{messages[maxRarity][rng]}</span>
				<CtaButton
					fontSize="14px;"
					loading={isRefreshing}
					disabled={isRefreshing}
					text="close"
					link="#"
					onClick={onClose}
				/>
			</div>
		</div>
	</div>
</div>

<style>
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
		background-color: rgba(0, 0, 0, 0.4);
	}

	/* Modal Content */
	.modal-content {
		background-color: var(--pure-black);
		display: table;
		height: 100%;
		width: 100%;
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

	.content {
		display: flex;
		height: 85%;
		justify-content: center;
	}
	@media (min-width: 1024px) {
		.blur {
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			z-index: -1;
			background: rgba(0, 0, 0, 0.7);
		}
		.modal {
			width: var(--maxWidth);
			height: var(--maxHeight);
			margin: auto;
			border: 3px solid var(--primary-teal);
		}
	}

	.wrapper {
		width: 100%;
		height: 100%;
		display: table-cell;
	}
	.flexwrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		vertical-align: middle;
		align-items: center;
	}
	.flexwrapper span {
		font-size: 26px;
		max-width: 300px;
		font-weight: 900;
		margin-bottom: 68px;
		text-align: center;

		color: #fff;
	}
</style>
