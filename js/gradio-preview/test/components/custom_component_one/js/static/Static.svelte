<script>
	import SharedComponent from "../shared";
	export let value = "static value";
</script>

<div class="wrap">
	<SharedComponent />

	<div class="main">
		<strong>Static</strong>
		<p>
			{value}
		</p>
	</div>
</div>

<style>
	p {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.35em 0.5em;
		background: #eee;
		margin-top: 5px;
		min-height: 2.5em;
	}

	.main {
		margin: 1em;
	}

	.wrap {
		/* border: 1px solid #ccc; */
		border-radius: 4px;
		/* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
		/* margin-bottom: 20px; */
	}
</style>
