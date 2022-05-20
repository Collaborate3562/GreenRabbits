<script>
	import { onMount } from 'svelte';

	export let level;
	export let character_id;
	export let percent = 0;
	export let withProgress = false;
	const max = 2160;
	let offset = ((100 - 0) / 100) * max;
	onMount(() => {
		setTimeout(() => {
			if (percent > 100) percent = 100;
			offset = ((100 - percent) / 100) * max;
		}, 200);
	});
</script>

<div class="level-icon flex center">
	<svg width="88" height="98" viewBox="0 0 88 98" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g filter="url(#filter0_d_293_7937)">
			<path
				d="M42 8.1547C43.2376 7.44017 44.7624 7.44017 46 8.1547L75.775 25.3453C77.0126 26.0598 77.775 27.3803 77.775 28.8094V63.1906C77.775 64.6197 77.0126 65.9402 75.775 66.6547L46 83.8453C44.7624 84.5598 43.2376 84.5598 42 83.8453L12.225 66.6547C10.9874 65.9402 10.225 64.6197 10.225 63.1906L10.225 28.8094C10.225 27.3803 10.9874 26.0598 12.225 25.3453L42 8.1547Z"
				fill="#0B3D2D"
			/>
		</g>
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M42.4128 8.01904C43.395 7.45199 44.6051 7.45199 45.5872 8.01904L76.0989 25.6349C77.081 26.202 77.6861 27.2499 77.6861 28.3841V63.6158C77.6861 64.75 77.081 65.7979 76.0989 66.365L45.5872 83.9809C44.6051 84.5479 43.395 84.5479 42.4128 83.9809L11.9012 66.365C10.919 65.7979 10.314 64.7499 10.314 63.6158V28.3841C10.314 27.2499 10.919 26.202 11.9012 25.6349L42.4128 8.01904ZM14.8489 29.1695V33.9687L19.1617 37.6586C19.3838 37.8486 19.5116 38.1262 19.5116 38.4185V53.5812C19.5116 53.8735 19.3838 54.1511 19.1617 54.3411L14.8489 58.031V62.8304L44 79.6608L73.1512 62.8304V58.0311L68.8383 54.3411C68.6162 54.1511 68.4884 53.8735 68.4884 53.5813V38.4185C68.4884 38.1263 68.6162 37.8487 68.8383 37.6587L73.1512 33.9687V29.1695L44 12.3391L14.8489 29.1695Z"
			fill="url(#paint0_linear_293_7937)"
		/>
		<path
			d="M44 75.9304L39.456 73.2574C38.5778 72.7409 38.9442 71.3955 39.963 71.3955H48.037C49.0558 71.3955 49.4222 72.7409 48.544 73.2574L44 75.9304Z"
			fill="url(#paint1_linear_293_7937)"
		/>
		<defs>
			<filter
				id="filter0_d_293_7937"
				x="0.225006"
				y="0.618652"
				width="87.55"
				height="96.7627"
				filterUnits="userSpaceOnUse"
				color-interpolation-filters="sRGB"
				>/
				<feFlood flood-opacity="0" result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feOffset dy="3" />
				<feGaussianBlur stdDeviation="5" />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
				<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_293_7937" />
				<feBlend
					mode="normal"
					in="SourceGraphic"
					in2="effect1_dropShadow_293_7937"
					result="shape"
				/>
			</filter>
			<linearGradient
				id="paint0_linear_293_7937"
				x1="25.8605"
				y1="12.8952"
				x2="44"
				y2="84.4062"
				gradientUnits="userSpaceOnUse"
			>
				<stop stop-color="#A0FFE1" />
				<stop offset="0.139285" stop-color="#81FFD7" />
				<stop offset="0.317622" stop-color="#E2FFF6" />
				<stop offset="0.459826" stop-color="#92FFDD" />
				<stop offset="0.645833" stop-color="#72F0C9" />
				<stop offset="0.796875" stop-color="#ABFFE5" />
				<stop offset="0.989583" stop-color="#36FFC0" />
			</linearGradient>
			<linearGradient
				id="paint1_linear_293_7937"
				x1="39.8486"
				y1="71.7085"
				x2="40.1414"
				y2="76.1829"
				gradientUnits="userSpaceOnUse"
			>
				<stop stop-color="#A0FFE1" />
				<stop offset="0.989583" stop-color="#36FFC0" />
			</linearGradient>
		</defs>
	</svg>
	<div class="wrapper">
		<span>
			{level}
		</span>
	</div>
	{#if withProgress}
		<div class="hex">
			<svg class="progress blue noselect" data-progress="55" x="0px" y="0px" viewBox="0 0 776 628">
				<path
					class="track"
					d="M674.769 494L363 674.001L51.23 494.001L51.231 134L363 -46.001L674.77 133.999L674.769 494z"
				/>
			</svg>
		</div>
		<div class="hex">
			<svg
				class="progress blue noselect shadow"
				data-progress="55"
				x="0px"
				y="0px"
				viewBox="0 0 776 628"
			>
				<path
					class="fill"
					style="stroke-dashoffset:{offset}"
					d="M674.769 494L363 674.001L51.23 494.001L51.231 134L363 -46.001L674.77 133.999L674.769 494z"
				/>
			</svg>
		</div>
	{/if}
</div>

<style>
	.hex {
		position: absolute;
	}
	.level-icon {
		z-index: 2;
	}
	.wrapper {
		position: absolute;
		margin-top: -4px;
	}
	.wrapper span {
		position: relative;
		font-style: normal;
		font-weight: 900;
		font-size: 24px;
		line-height: 48px;
	}
	/*===== The CSS =====*/
	.progress {
		width: 110px;
		height: 240px;

		margin-right: -4px;
		margin-top: -8px;
	}
	.shadow {
		filter: drop-shadow(0px 0px 4px #36ffc0);
	}
	.progress .track,
	.progress .fill {
		fill: rgba(0, 0, 0, 0);
		stroke-width: 30;
		transform: translate(290px, 800px) rotate(-120deg);
	}
	.progress .track {
		stroke: #585858;
	}
	.progress .fill {
		stroke: rgb(255, 255, 255);
		stroke-linecap: round;
		stroke-dasharray: 2160;
		stroke-dashoffset: 2160;
		transition: stroke-dashoffset 1s;
	}
	.progress.blue .fill {
		stroke: #74fac0;
	}
	.progress.green .fill {
		stroke: rgb(186, 223, 172);
	}
	.progress .value,
	.progress .text {
		font-family: 'Open Sans';
		fill: rgb(255, 255, 255);
		text-anchor: middle;
	}
	.progress .value {
		font-size: 180px;
	}
	.progress .text {
		font-size: 120px;
	}
	.noselect {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		cursor: default;
	}
</style>
