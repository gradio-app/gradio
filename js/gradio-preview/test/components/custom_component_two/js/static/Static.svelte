<script>
	import SharedComponent from "../shared";
	export let value = "static value";
</script>

<div class="wrap">
	<SharedComponent />

	<div class="main">
		<strong>Static Value</strong>
		<p>
			{value}
		</p>
	</div>
</div>

<style>
	p {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.5em 1em;
	}

	.main {
		margin: 1em;
	}

	.wrap {
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
</style>
