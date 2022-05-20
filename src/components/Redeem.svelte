<script>
	import { activeUser } from 'src/stores/store';

	import { greenRabbitApi } from 'src/utils/green.rabbit.api';

	import { onMount } from 'svelte';

	import CtaButton from './CTAButton.svelte';
	import { getContext } from 'svelte';
	import RedeemModal from './RedeemModal.svelte';
	let chestSizes = {
		common: 50000,
		uncommon: 420000,
		epic: 2500000,
		legendary: 10000000,
		mythic: 42000000
	};
	const { open } = getContext('simple-modal');
	let chests = [];
	let innerWidth;
	function getReward(chest, redeemables) {
		for (let reward of redeemables) {
			if (reward.template_id == Number(chest.template.template_id)) {
				chest.reward = reward.contents;
				break;
			} else {
				let rarity = chest.data.Rarity;

				rarity = rarity ? rarity.toLowerCase() : '';
				chest.reward = [chestSizes[rarity].toFixed(4) + ' SHELL'];
			}
		}
	}
	function addSizesToChests(chests, redeemables) {
		for (let chest of chests) {
			getReward(chest, redeemables);
		}
		return chests;
	}
	async function refreshChests(fail = false) {
		if (!fail) {
			greenRabbitApi.fetchCollections().then((collections) => {
				greenRabbitApi.fetchRedeemables().then((redeemables) => {
					greenRabbitApi.fetchChests($activeUser, collections).then((res) => {
						if (res) {
							chests = res.data;

							chests = addSizesToChests(chests, redeemables);
							handleRedeem();
							clearSelects();
						}
					});
				});
			});
		} else {
			handleRedeem();
		}
	}

	async function clearSelects() {
		for (let chest of chests.filter((e) => e.isSelected)) {
			chest.isSelected = undefined;
		}
	}
	async function handleRedeem() {
		open(
			RedeemModal,
			{ chests, refreshChests },
			innerWidth > 1024
				? {
						styleWindow: {
							maxWidth: '1100px',
							minWidth: '1100px',
							minHeight: '748px',
							maxHeight: '749px'
						},
						styleContent: {
							position: 'initial'
						}
				  }
				: {
						styleWindow: {
							maxWidth: '100vw',
							minWidth: '100vw',
							minHeight: '100vh',
							maxHeight: '100vh'
						},
						styleWindowWrap: {
							height: ' 100vh',
							width: '100vw',
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							margin: 0,
							padding: 0
						},
						styleContent: {
							position: 'initial'
						}
				  }
		);
	}
	onMount(() => {
		greenRabbitApi.fetchCollections().then((collections) => {
			greenRabbitApi.fetchRedeemables().then((redeemables) => {
				greenRabbitApi.fetchChests($activeUser, collections).then((res) => {
					if (res) {
						chests = res.data;

						chests = addSizesToChests(chests, redeemables);
					}
				});
			});
		});
	});
</script>

<svelte:window bind:innerWidth />
<div class="redeem">
	<img
		src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/v1627107559/GreenRabbit/shell_redeem.png"
		alt="Shellinium chests"
		class="redeem__Img"
	/>
	<div class="redeem-wrap">
		<h1>Redeem your Shellinium chests here</h1>
		<h2>You have <span>{chests.length} chests</span> to redeem</h2>
		<CtaButton disabled={chests.length == 0} fontSize="18px" text="redeem" onClick={handleRedeem} />
	</div>
</div>

<style>
	h1 {
		font-size: 28px;
		margin-bottom: 16px;
	}
	h2 {
		font-size: 20px;
		text-align: center;
		margin-bottom: 96px;
	}
	h2 span {
		color: rgb(54, 255, 192);
	}
	.redeem-wrap {
		display: flex;
		flex-direction: column;
		-moz-box-align: center;
		align-items: center;
		margin-top: 80px;
	}
	.redeem__Img {
		position: absolute;
		top: -115px;
	}
	.redeem {
		height: 550px;
		width: 940px;
		max-width: 800px;
		margin: 200px auto 100px;
		padding: 48px 12px;
		position: relative;
		border: 2px solid rgb(54, 255, 192);
		color: rgb(255, 255, 255);
		display: flex;
		-moz-box-pack: center;
		justify-content: center;
		-moz-box-align: center;
		align-items: center;
	}
	@media (max-width: 1000px) {
		.redeem {
			width: 90%;
			height: 378px;

			margin: 67px auto 72px;
		}
		h2 {
			text-align: center;
			margin-bottom: 50px;
			font-size: 16px;
		}
		.redeem__Img {
			top: -38px;
			width: 50%;
		}
	}
	@media (max-width: 670px) {
		.redeem__Img {
			width: 70%;
		}
	}
	@media (max-width: 400px) {
		.redeem__Img {
			top: -5vh;
			width: 90%;
		}
	}
	@media (max-width: 636px) {
		h1 {
			text-align: center;
			font-size: 22px;
		}
	}
</style>
