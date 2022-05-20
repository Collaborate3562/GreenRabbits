<script>
	import { now } from 'src/stores/store';
	import { onDestroy, onMount } from 'svelte';

	export let start = 0;
	export let id;

	var iD = 0,
		iH = 0,
		iM = 0,
		iS = 0;

	let days;
	let hours;
	let minutes;
	let seconds;

	var iD = 0,
		iH = 0,
		iM = 0,
		iS = 0;

	let isDropActive = false;
	let startTime;
	let ticker;

	function doTimeCalcs() {
		startTime = start;

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

		days = iD;
		hours = iH;
		minutes = iM;
		seconds = iS;
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
	});

	onDestroy(() => {
		clearInterval(ticker);
	});

	function getStarted() {
		if (start == 0) return true;
		return $now >= start;
	}

	function activeDrop(now) {
		return getStarted();
	}

	$: {
		isDropActive = activeDrop($now);
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
		return getFormattedTimeString(days, hours, minutes, seconds);
	}

	let timerText;
	$: {
		timerText = getStartTimeText($now);
	}
</script>

{#if !isDropActive}
	<p>
		{timerText}
	</p>
{/if}
