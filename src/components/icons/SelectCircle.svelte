<script>
	export let data;
	export let selectedItem;
	$: selected = selectedItem ? data.asset_id === selectedItem.asset_id : false;
</script>

<div class="circle1" style="--selected: {selected ? '""' : 'none'}" />

<style>
	.circle1 {
	}
	.circle1::before {
		content: '';
		width: 16px;
		height: 16px;
		position: absolute;
		left: auto;
		right: 8px;
		top: 18px;
		border-radius: 50%;
		border: 1px solid rgb(220, 220, 220);
		border-top-color: rgb(220, 220, 220);
		border-right-color: rgb(220, 220, 220);
		border-bottom-color: rgb(220, 220, 220);
		border-left-color: rgb(220, 220, 220);
		background: rgb(56, 55, 61) none repeat scroll 0% 0%;
		border-color: var(--primary-teal);
	}

	.circle1::after {
		content: var(--selected);
		width: 8px;
		height: 8px;
		position: absolute;
		left: auto;
		right: 12px;
		top: 22px;
		border-radius: 50%;
		background: var(--primary-teal) none repeat scroll 0% 0%;
		z-index: 1;
	}
</style>
