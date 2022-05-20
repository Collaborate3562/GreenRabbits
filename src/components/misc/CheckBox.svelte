<script>
	export let checked;
	export let label = '';
</script>

<div class="checkbox">
	<label class="container">
		<input type="checkbox" bind:checked />
		<span class="checkmark" class:empty={!checked} />
	</label>
	<label class="label-text" for="checkbox">{label}</label>
</div>

<style>
	.label-text {
		font-style: normal;
		font-weight: bold;
		font-size: 16px;
		line-height: 25px;
		text-transform: uppercase;
	}
	.checkbox {
		display: flex;
	}
	.checkbox .container {
		margin-right: 10px;
	}
	.container {
		display: block;
		position: relative;
		padding-left: 24px;
		margin-bottom: 12px;
		cursor: pointer;
		font-size: 22px;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	/* Hide the browser's default checkbox */
	.container input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}
	/* Create a custom checkbox */
	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 25px;
		width: 25px;
		background-color: #36ffc0;
		border: 1px solid #36ffc0;
	}
	.empty {
		background-color: black !important;
	}
	/* Create the checkmark/indicator (hidden when not checked) */
	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}
	/* Show the checkmark when checked */
	.container input:checked ~ .checkmark:after {
		display: block;
	}
	/* Style the checkmark/indicator */
	.container .checkmark:after {
		left: 6px;
		top: 2px;
		width: 10px;
		height: 15px;
		border: solid #000;
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		transform: rotate(45deg);
	}
</style>
