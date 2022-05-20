<script>
	import { Popover } from 'sveltestrap';
	import CTAButton from 'src/components/CTAButton.svelte';

	export let nftData;
	let innerWidth;
	let openInfoBox = false;

	function boostString(stat) {
		const base = Number(nftData.baseStats[stat.toLowerCase()]);
		const real = Number(nftData.mutable_data[stat]);
		const boost = real - base;
		if (boost) {
			return `${base} +${boost.toFixed(2)}`;
		}
		return `${base}`;
	}
	let bonusStat = nftData?.bonusStats?.total || 0;
	let boostCount = nftData.mutable_data['Boost Count'] || 0;
	function calcBaseTotal() {
		return (
			Number(nftData.baseStats.agility) +
			Number(nftData.baseStats.intellect) +
			Number(nftData.baseStats.luck) +
			Number(nftData.baseStats.resilience) +
			Number(nftData.baseStats.speed) +
			Number(nftData.baseStats.strength)
		);
	}
	function calcRealTotal() {
		return (
			Number(nftData.mutable_data.Agility) +
			Number(nftData.mutable_data.Intellect) +
			Number(nftData.mutable_data.Luck) +
			Number(nftData.mutable_data.Resilience) +
			Number(nftData.mutable_data.Speed) +
			Number(nftData.mutable_data.Strength)
		);
	}
	function toggleMobileInfoBox() {
		openInfoBox = !openInfoBox;
	}
</script>

<svelte:window bind:innerWidth />

{#if nftData.schema.schema_name == 'greenprints'}
	{#if innerWidth > 768}
		<div class="tooltip show">
			<img
				class="info-icon"
				alt="information"
				id={`btn-${nftData.asset_id}`}
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
			/>
			<Popover trigger="hover" placement="top" target={`btn-${nftData.asset_id}`}>
				<table class="tooltip-table">
					<tbody>
						<tr>
							<td><b>Mint</b></td>
							<td>{nftData.template_mint || 0}</td>
							<td class="table-divider" />
							<td><b>Strength</b></td>
							<td>{boostString('Strength')}</td>
						</tr>
						<tr>
							<td><b>Rarity</b></td>
							<td>{nftData.data.Rarity || ''}</td>
							<td class="table-divider" />
							<td><b>Resilience</b></td>
							<td>{boostString('Resilience')}</td>
						</tr>
						<tr>
							<td><b>Totem</b></td>
							<td>{nftData.totem || ''}</td>
							<td class="table-divider" />
							<td><b>Agility</b></td>
							<td>{boostString('Agility')}</td>
						</tr>
						<tr>
							<td><b>Crafted With</b></td>
							<td>{nftData.mutable_data['Crafted With'] || ''}</td>
							<td class="table-divider" />
							<td><b>Speed</b></td>
							<td>{boostString('Speed')}</td>
						</tr>
						<tr>
							<td><b>Boosted</b></td>
							<td>{boostCount}</td>
							<td class="table-divider" />
							<td><b>Intellect</b></td>
							<td>{boostString('Intellect')}</td>
						</tr>
						<tr>
							<td><b>Bonus Stats</b></td>
							<td>+{bonusStat.toFixed(2)}%</td>
							<td class="table-divider" />
							<td><b>Luck</b></td>
							<td>{boostString('Luck')}</td>
						</tr>
					</tbody>
				</table>
			</Popover>
		</div>
	{/if}
	{#if innerWidth < 769}
		<div class="tooltip show">
			<img
				class="info-icon"
				alt="information"
				on:click={toggleMobileInfoBox}
				src="https://res.cloudinary.com/green-rabbit-holdings/image/upload/f_auto,q_auto/v1629231357/GreenRabbit/icons/info-icon.png"
			/>
			{#if openInfoBox}
				<div class="info-box">
					<h2>Greenprint information <button on:click={toggleMobileInfoBox} class="close" /></h2>
					<table class="tooltip-table">
						<tbody>
							<tr>
								<td><b>Mint</b></td>
								<td>{nftData.template_mint || 0}</td>
								<td class="table-divider" />
								<td><b>Strength</b></td>
								<td>{boostString('Strength')}</td>
							</tr>
							<tr>
								<td><b>Rarity</b></td>
								<td>{nftData.data.Rarity || ''}</td>
								<td class="table-divider" />
								<td><b>Resilience</b></td>
								<td>{boostString('Resilience')}</td>
							</tr>
							<tr>
								<td><b>Totem</b></td>
								<td>{nftData.totem || ''}</td>
								<td class="table-divider" />
								<td><b>Agility</b></td>
								<td>{boostString('Agility')}</td>
							</tr>
							<tr>
								<td><b>Crafted With</b></td>
								<td>{nftData.mutable_data['Crafted With'] || ''}</td>
								<td class="table-divider" />
								<td><b>Speed</b></td>
								<td>{boostString('Speed')}</td>
							</tr>
							<tr>
								<td><b>Boosted</b></td>
								<td>{boostCount}</td>
								<td class="table-divider" />
								<td><b>Intellect</b></td>
								<td>{boostString('Intellect')}</td>
							</tr>
							<tr>
								<td><b>Bonus Stats</b></td>
								<td>+{bonusStat.toFixed(2)}%</td>
								<td class="table-divider" />
								<td><b>Luck</b></td>
								<td>{boostString('Luck')}</td>
							</tr>
						</tbody>
					</table>
					<div class="info-btn">
						<CTAButton onClick={toggleMobileInfoBox} width="100%" fontSize="16px" text={'OK'} />
					</div>
				</div>
				<div class="info-mask" />
			{/if}
		</div>
	{/if}
{/if}

<style>
	h1 {
		font-size: 22px;
		font-weight: 900;
	}
	.tooltip {
		position: relative;
		display: inline-block;
		width: 20px;
		height: 20px;
		position: absolute;
		top: 15px;
		left: 15px;
	}
	/* .tooltip .tooltiptext {
		visibility: hidden;
		width: 380px;
		background-color: #fff;
		color: #000;
		text-align: left;
		border-radius: 2px;
		padding: 15px;
		position: fixed;
		z-index: 1111;
		margin-left: -180px;
		margin-top: -215px;
	}
	.tooltip .tooltiptext::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -10px;
		border-width: 10px;
		border-style: solid;
		border-color: white transparent transparent transparent;
	}
	.tooltip:hover .tooltiptext {
		visibility: visible;
	} */
	.tooltip-table {
		width: 100%;
	}
	.tooltip-table td {
		font-size: 14px;
	}
	.table-divider {
		width: 8%;
	}
	.info-box {
		position: fixed;
		bottom: 0;
		width: 100vw;
		background: black;
		color: white;
		z-index: 1111;
		left: 0;
		border-top: 3px solid #36ffcc;
		height: 55vh;
		padding: 20px;
		overflow: auto;
	}
	.info-box h2 {
		font-weight: 700;
		margin-bottom: 20px;
	}
	.info-mask {
		position: fixed;
		width: 100vw;
		height: 100vh;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: black;
		z-index: 1110;
		opacity: 0.7;
	}
	.info-btn {
		width: 100%;
		margin-top: 30px;
		padding: 0 5%;
	}

	.close {
		display: block;
		box-sizing: border-box;
		position: absolute;
		z-index: 1000;
		top: 1rem;
		right: 1rem;
		margin-left: auto;
		padding: 0;
		width: 22px;
		height: 22px;
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
	@media (max-width: 1024px) {
		.tooltiptext {
			display: none;
		}
	}
</style>
