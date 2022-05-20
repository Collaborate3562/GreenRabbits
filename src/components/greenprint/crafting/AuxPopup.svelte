<script>
	export let name;
	export let imgSrc;
</script>

<div class="desc-wrapper">
	<img alt="aux coin" src={`https://ipfs.io/ipfs/${imgSrc}`} />
	<div class="text">
		<h1>{name}</h1>
		<p>
			The Greenprint Shellinium Credit Token can be used when crafting with a 3D NFT of the same
			rarity type or when crafting with 4-Components and attempting to use the 4-Component
			Shellinium Credit. This is a SINGLE USE NFT that once successfully used within the Auxiliary
			Slot, will cover the cost of all base Shellinium used in a crafting attempt and then itself be
			consumed. If the craft attempt is unsuccessful, this credit will be returned to the holder for
			use in a future attempt. This Credit DOES NOT cover any of the SPU Leasing costs.
		</p>
	</div>
</div>

<style>
	.desc-wrapper {
		display: flex;
		flex-direction: column;
	}

	img {
		height: 320px;
		margin: 0 auto;
	}
	h1 {
		font-size: 24px;
		color: var(--primary-teal);
	}
	p {
	}

	@media (min-width: 768px) {
		.desc-wrapper {
			flex-direction: row;
			align-items: center;
		}
	}
</style>
