<script>
	import { now } from 'src/stores/store';
	import { onDestroy, onMount } from 'svelte';
	import CTAButton from './CTAButton.svelte';

	export let initialMinute = 0;
	export let initialSeconds = 0;
	export let text;
	export let link;
	export let outlined;
	export let width;
	export let height;
	export let onClick;
	export let uppercase;
	export let target;
	export let margin;
	export let loading;
	export let disabledFully;
	export let backButton;
	export let start = 0;
	export let end = 0;

	export let buttonText;
	export let isButton;
	export let id;
	var iD = 0,
		iH = 0,
		iM = 0,
		iS = 0,
		iDE = 0,
		iHE = 0,
		iME = 0,
		iSE = 0;

	let days;
	let hours;
	let minutes;
	let seconds;

	let daysEnd;
	let hoursEnd;
	let minutesEnd;
	let secondsEnd;

	if (start == 0) start = $now;
	var iD = 0,
		iH = 0,
		iM = 0,
		iS = 0,
		iDE = 0,
		iHE = 0,
		iME = 0,
		iSE = 0;

	let isDropActive = false;

	let ticker;

	function doTimeCalcs() {
		var startTime = end;

		if (isButton) startTime = start;

		if (start > 0) {
			var delta = Math.abs(startTime - $now);
			iD = Math.floor(delta / 86400);
			delta -= iD * 86400;

			// calculate (and subtract) whole hours
			iH = Math.floor(delta / 3600) % 24;
			delta -= iH * 3600;

			// calculate (and subtract) whole minutes
			iM = Math.floor(delta / 60) % 60;
			delta -= iM * 60;

			// what's left is seconds
			iS = Math.floor(delta % 60);
		}

		if (end > 0) {
			var delta2 = Math.abs(end - $now);
			iDE = Math.floor(delta2 / 86400);
			delta -= iDE * 86400;

			// calculate (and subtract) whole hours
			iHE = Math.floor(delta2 / 3600) % 24;
			delta -= iHE * 3600;

			// calculate (and subtract) whole minutes
			iME = Math.floor(delta2 / 60) % 60;
			delta -= iME * 60;

			// what's left is seconds
			iSE = Math.floor(delta2 % 60);
		}

		days = iD;
		hours = iH;
		minutes = iM;
		seconds = iS;

		daysEnd = iDE;
		hoursEnd = iHE;
		minutesEnd = iME;
		secondsEnd = iSE;
	}

	onMount(async () => {
		doTimeCalcs();
		ticker = setInterval(() => {
			doTimeCalcs();
		}, 1000);

		if (start < $now) {
			days = 0;
			hours = 0;
			minutes = 0;
			seconds = 0;
		}

		if (end < $now) {
			daysEnd = 0;
			hoursEnd = 0;
			minutesEnd = 0;
			secondsEnd = 0;
			return;
		}
	});

	onDestroy(() => {
		clearInterval(ticker);
	});

	function getStarted() {
		if (start == 0) return true;
		return $now > start;
	}

	function getEnded() {
		if (end == 0) return false;
		return $now > end;
	}

	function activeDrop() {
		return getStarted() && !getEnded();
	}

	let hasStarted;
	let hasEnded;
	let neverEnds = end == 0;
	$: {
		if ($now) {
			isDropActive = activeDrop();
			hasStarted = getStarted();
			hasEnded = getEnded();
		}
	}

	function getFormattedTimeString(daysVal, hoursVal, minutesVal, secondsVal) {
		let formattedString = '';
		const gotDays = daysVal > 0;
		const gotHours = hoursVal > 0;
		const gotMinutes = minutesVal > 0;
		const gotSeconds = secondsVal > 0;

		// Add days if we have some
		if (gotDays) {
			const formattedDays = daysVal < 10 ? `0${daysVal}` : daysVal;
			formattedString = `${formattedDays}:`;
		}

		// Add hours if we have some
		if (gotHours || gotDays) {
			const formattedHours = hoursVal < 10 ? `0${hoursVal}` : hoursVal;
			formattedString = `${formattedString}${formattedHours}:`;
		}

		// Add minutes if we have some
		if (gotMinutes || gotDays || gotHours) {
			const formattedMinutes = minutesVal < 10 ? `0${minutesVal}` : minutesVal;
			formattedString = `${formattedString}${formattedMinutes}:`;
		}

		// Add seconds if we have some
		if (gotSeconds || gotDays || gotHours || gotMinutes) {
			const formattedSeconds = secondsVal < 10 ? `0${secondsVal}` : secondsVal;
			formattedString = `${formattedString}${formattedSeconds}`;
		}

		// add "seconds" text if we are down to just seconds
		if (gotSeconds && !gotDays && !gotHours && !gotMinutes) {
			formattedString = `${formattedString} seconds`;
		}

		return formattedString;
	}

	function getStartTimeText(now) {
		if (isDropActive || hasEnded || hasStarted) {
			return buttonText;
		}
		return getFormattedTimeString(days, hours, minutes, seconds);
	}

	function getEndTimeText(now) {
		return getFormattedTimeString(daysEnd, hoursEnd, minutesEnd, secondsEnd);
	}

	let ctaButtonText;
	$: {
		ctaButtonText = getStartTimeText($now);
	}

	let timeEndText;
	$: {
		timeEndText = getEndTimeText($now);
	}
</script>

{#if isButton}
	<CTAButton
		text={ctaButtonText}
		disabled={!isDropActive || disabledFully}
		{onClick}
		{width}
		fontSize="16px"
		{height}
		{margin}
		{link}
	/>
{:else if isDropActive && !(buttonText == 'sold out' || buttonText == 'max bought') && !neverEnds}
	<div class="end-timer">
		Sale ends in: {timeEndText}
	</div>
{/if}

<style>
	.end-timer {
		border-radius: 19px;
		width: fit-content;
		margin-top: 5px;
		background-color: rgba(29, 29, 29, 0.86);
		padding: 4px 20px;
		width: 180px;
		font-size: 14px;
		text-align: center;
	}
</style>
