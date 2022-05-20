<script>
	import { now } from 'src/stores/store';

	export let end = 0;

	var iD = 0,
		iH = 0,
		iM = 0,
		iS = 0;

	function getTimeString() {
		if (end > 0) {
			var delta = Math.abs(end - $now);
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
		return (
			(iH < 10 ? `0${iH}` : iH) + ':' + (iM < 10 ? `0${iM}` : iM) + ':' + (iS < 10 ? `0${iS}` : iS)
		);
	}

	let timeString;
	$: {
		if ($now) timeString = getTimeString();
	}
</script>

{timeString ? timeString : ''}
