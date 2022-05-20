<script>
	export let cardType = '';
	export let data = false;

	const rarities = {
		common: '#878787',
		uncommon: '#F2B47D',
		epic: '#FFFFFF',
		legendary: '#FFD500',
		mythic: '#3CE900'
	};
</script>

<div
	class="wrapper"
	style="--border-color:{data ? 'var(--primary-teal)' : 'rgba(54, 255, 192, 0.5)'};"
>
	{#if !data}
		<div class="image-placeholder">
			<div class="_placeholder">+</div>
		</div>
	{:else}
		<div class="image">
			<div class="remove"><img alt="Close button" src="/icons/close-btn.svg" /></div>
			<img
				alt="Crafting Component"
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/c_scale/GreenRabbit/nfts/Qmcn4AXVbT4uyvjrRVswwmspx8WWaijy6GCBehj4Mvs819.png"
			/>
		</div>
	{/if}
	<div class="bottom">
		<div class="bottom-card-info">
			<div
				class="rarity"
				style="--rarity-color:{data ? rarities['mythic'] : 'var(--grayed-out)'}; --is-disabled:{data
					? '#fff'
					: 'var(--grayed-out)'}; "
			>
				{data ? 'MYTHIC' : 'RARITY'}
			</div>
			<div
				class="totem"
				style="--rarity-color:{data ? '#fff' : 'var(--grayed-out)'}; --is-disabled:{data
					? '#fff'
					: 'var(--grayed-out)'};"
			>
				TOTEM
			</div>
		</div>
		<p class="card-type">{cardType}</p>
	</div>
</div>

<style>
	.remove {
		position: absolute;

		top: 10px;
		right: 10px;
		border-radius: 50px;
		color: var(--primary-teal);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.card-type {
		font-size: 14px;
		margin-top: 14px;
		text-align: center;
		font-weight: 600;
	}
	.rarity,
	.totem {
		width: 132px;
		height: 25px;
		border-radius: 19px;
		border: 1px solid var(--rarity-color);
		font-size: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--is-disabled);
	}
	.rarity {
		margin-bottom: 4px;
	}
	.totem {
	}
	.bottom {
		margin-top: 10px;
	}
	.wrapper {
		position: relative;
		width: 150px;
		height: 242px;
		padding: 8px;
		border: solid 2px var(--border-color);
		background-color: #141414;
		cursor: pointer;
	}

	.image-placeholder {
		width: 130px;
		height: 120px;
		border: 2px dashed var(--greenish-cyan);
		display: flex;
	}
	.image {
		width: 130px;
		height: 120px;
		display: flex;
	}
	.image img {
		margin: 0 auto;
	}

	._placeholder {
		width: 24px;
		height: 24px;
		border: 2px solid var(--primary-teal);
		border-radius: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--primary-teal);
		position: relative;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
	}

	@media (min-width: 768px) {
		.wrapper {
			width: 235px;
			height: 340px;
			overflow: initial;
		}

		.remove {
			position: absolute;
			top: -25px;
			right: -30px;
		}
		.image-placeholder,
		.image {
			width: 205px;
			height: 205px;
			margin: 0 auto;
			position: relative;
		}
		.bottom-card-info {
			display: flex;
			margin-top: 20px;
			margin-bottom: 25px;
		}
		._placeholder {
			width: 41px;
			height: 41px;
			font-size: 28px;
		}
	}

	@media (min-width: 1260px) {
		.bottom-card-info .rarity,
		.bottom-card-info .totem {
			width: 100px !important;
		}
	}
</style>
