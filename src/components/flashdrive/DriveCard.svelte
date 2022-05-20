<script>
	import { assetsInPool } from 'src/stores/store';

	import { toFixedCurrency } from 'src/utils/toFixedCurrency';
	export let disabled;
	export let drive;
	export let partner;

	let assets = [];
	let power = 0;

	$: {
		if (drive) {
			assets = $assetsInPool.filter((asset) => String(asset.drive_id) == String(drive.asset_id));
			assets.forEach((a) => {
				power += parseInt(a.weight);
			});
		}
	}
</script>

{#if drive}
	<div class="drive-card" style="--primary:{partner.primaryColor}">
		<img class="drive-image" src={'https://ipfs.io/ipfs/' + drive.media.split(':')[1]} alt="" />
		<img class="drive-logo" src={partner.logo} alt="" />
		<div class="card-label">
			<span>Storage</span>
			<span class="teal">{drive.space_used}/{drive.capacity} bits</span>
		</div>
		<div class="card-label">
			<span>Staked NFTs</span>
			<span class="teal">{assets.length}</span>
		</div>
		<div class="card-label mt-16">
			<span>Shell/h</span>
			<span class="teal">{toFixedCurrency(power / 10000, 2)}</span>
		</div>
	</div>
{:else if !disabled}
	<div class="drive-card" style="--primary:{partner.primaryColor}">
		<img class="add-drive-circle" src="/icons/add_usb.svg" alt="Flashdrive circles" />
		<div class="plugin">Plug-in Flash Drive</div>
	</div>
{:else}
	<div class="drive-card-disabled" style="--primary:{partner.primaryColor}">
		<!-- 	<img class="add-drive-circle" src="/icons/add_usb.svg" alt="Flashdrive circles" /> -->
		<div class="add-drive-circle">
			<svg
				width="33"
				height="47"
				viewBox="0 0 33 47"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M5.25 46.2734H27.6797C30.6562 46.2734 32.1328 44.8203 32.1328 41.5625V24.125C32.1328 21.0547 30.8203 19.5781 28.1719 19.4141V13.7422C28.1719 5.49219 22.8047 0.992188 16.4531 0.992188C10.1016 0.992188 4.73438 5.49219 4.73438 13.7422V19.4609C2.22656 19.7188 0.773438 21.1953 0.773438 24.125V41.5625C0.773438 44.8203 2.25 46.2734 5.25 46.2734ZM7.64062 13.4609C7.64062 7.34375 11.5078 3.73438 16.4531 3.73438C21.3984 3.73438 25.2891 7.34375 25.2891 13.4609V19.4141L7.64062 19.4375V13.4609Z"
					fill="#9A9A9A"
				/>
			</svg>
		</div>

		<div class="plugin">Plug-in Flash Drive</div>
	</div>
{/if}

<style>
	.drive-card {
		width: 235px;
		height: 237px;
		background-image: linear-gradient(to bottom, #4b4b4b, #292828);
		cursor: pointer;
		position: relative;
		padding: 20px 10px;
	}
	.drive-card:hover {
		box-shadow: 0 0 0 2px var(--primary);
	}
	.drive-card .drive-image {
		object-fit: contain;
		border: solid 3px var(--primary);
		background-color: #000;
		border-radius: 50%;
		position: absolute;
		width: 127px;
		height: 127px;
		top: -64px;
		left: 57px;
	}
	.drive-card .drive-logo {
		height: 30px;
		width: auto;
		margin: 25px auto;
		margin-top: 60px;
	}
	.drive-card-disabled {
		width: 235px;
		height: 237px;
		background-image: linear-gradient(to bottom, #4b4b4b, #292828);

		position: relative;
		padding: 20px 10px;
		opacity: 0.5;
		cursor: not-allowed;
	}

	.drive-card-disabled .add-drive-circle {
		width: 60px;
		height: 60px;
		margin: 35px auto;
		fill: white;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.drive-card-disabled .plugin {
		font-size: 20px;
		font-weight: 700;
		color: white;
		text-align: center;
	}
	.drive-card .add-drive-circle {
		width: 60px;
		height: 60px;
		margin: 35px auto;
	}
	.drive-card .plugin {
		font-size: 20px;
		font-weight: 700;
		color: var(--primary-teal);
		text-align: center;
	}
	.card-label {
		display: flex;
		font-size: 16px;
		font-weight: 600;
	}
	.card-label .teal {
		color: var(--primary-teal);
		margin-left: 15px;
	}
	.mt-16 {
		margin-top: 16px;
	}
	@media (max-width: 1024px) {
		.wrapper {
			margin-top: 0;
		}
		.header-content h1 {
			width: 40%;
		}
		.shell-info {
			width: 60%;
		}
		.drives {
			justify-content: space-around;
		}
	}
	@media (max-width: 768px) {
		.header_bg {
			height: fit-content;
			background-position: left;
		}
		.back-btn {
			width: 100%;
		}

		.header-content {
			flex-direction: column;
		}
		.header-content h1 {
			text-align: center;
			width: 100%;
			margin-top: 0;
		}
		.shell-info {
			flex-direction: column;
			width: 100%;
			font-size: 16px;
			margin-bottom: 20px;
		}
		.num-staked {
			flex-direction: row;
			width: 100%;
			justify-content: space-between;
			border-bottom: 1px solid #444;
			padding-top: 5px;
		}
		.num-staked:last-child {
			border-bottom: none;
		}
		.num-staked .teal {
			font-size: 18px;
		}
	}
</style>
