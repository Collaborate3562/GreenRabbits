<script>
	import img_lock from '../../../static/assets/mission/img-lock.png';
</script>

<div class="center-text">
	<div class="clip-wrap">
		<div class="clip-each border-style-gradient clip-each-lock">
			<button class="btn btn-lock">
				<img src={img_lock} alt="img-lock" />
			</button>
		</div>
	</div>
</div>

<style>
	.center-text {
		text-align: center;
	}

	.clip-wrap {
		display: inline-block;
		vertical-align: top;
		padding: 10px;
	}

	.clip-each {
		width: 257px;
		height: 240px;
		position: relative;
	}

	.clip-each:after {
		content: '';
		position: absolute;
		background: #000;
	}

	.clip-each,
	.clip-each:after {
		clip-path: polygon(16% 0, 100% 0, 100% 83%, 86% 100%, 0 99%, 0 16%);
	}
	.clip-each-lock {
		opacity: 0.3;
	}
	.border-style-gradient {
		background: #36ffc0;
	}

	.border-style-gradient:after {
		top: 3px;
		left: 3px;
		right: 3px;
		bottom: 3px;
	}
	.btn-lock {
		position: relative;
		z-index: 10;
		width: 48px;
		height: 48px;
		top: 40%;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		background: transparent;
	}
</style>
