<script>
	import Character110 from '../../../static/assets/mission/character110.png';
	import Symbol100 from '../../../static/assets/mission/symbol100.png';
	import CtaButton from '../CTAButton.svelte';
	import LevelIcon from '../icons/LevelIcon.svelte';
	export let onClick;
	export let result;
	export let level;
	export let character;
	const outcomes = {
		one: 1,
		two: 2,
		three: 3
	};
</script>

<div class="content">
	<div class="left">
		<img src="/assets/mission/levelup.png" class="character" alt="character" />
		<img
			class="char-img"
			src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/q_auto/GreenRabbit/nfts/unframed/{character
				.data.img}.png"
			alt=""
		/>
	</div>
	<div class="right">
		<div class="symbol">
			<LevelIcon {level} />
		</div>
		<div class="group">
			<p class="text">Your Forager has Leveled Up!</p>
			<p class="text smallerfont">
				<span class="points">{outcomes[result.outcome]}</span> Stat point{outcomes[result.outcome] >
				1
					? 's'
					: ''} gained!
			</p>
			<CtaButton width="195px" height="45px" fontSize="16px" {onClick} text="CLAIM!" />
			<!-- <div class="btn" on:click={onClick}>GREAT!</div> -->
		</div>
	</div>
</div>

<style>
	.points {
		color: var(--primary-teal);
	}
	.char-img {
		position: absolute;
		max-height: 60%;
	}
	.smallerfont {
		font-size: 17px;
	}
	.btn {
		width: 195px;
		height: 45px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		font-size: 16px;
		background-color: #36ffc0;
	}
	.content {
		width: 750px;
		height: 510px;

		margin: 0 auto;
		display: flex;
		background: #0000006e;
	}
	.group {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.left {
		width: 55%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.right {
		margin: auto;
		width: 45%;
		height: 55%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-around;
		background: #0000000d;
	}
	.text {
		font-weight: bold;
		font-size: 20px;
		margin-bottom: 20px;
	}
	.wrapper {
		max-width: 1440px;
		color: white;
		width: 100%;
		display: flex;
		align-items: center;
		height: 100%;
		margin: 0 auto;
	}
	.container {
		height: 90vh;
		background: url('/assets/mission/bg119.png');
		background-repeat: no-repeat;
		background-size: cover;
	}

	@media (max-width: 768px) {
		.left {
			width: 100%;
			height: auto;
		}
		.right {
			width: 100%;
			margin: 0;
			height: auto;
			padding-bottom: 20px;
		}
		.container {
			height: 75vh;
		}
		.content {
			width: 100%;
			height: 100%;
			border: none;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			background: #0000006e;
		}
	}
	@media (max-width: 480px) {
		.container {
			height: 98vh;
		}
	}
</style>
