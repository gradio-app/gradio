<script>
	import SharedComponent from "../shared";
	export let value = "Hello";
</script>

<div class="wrap">
	<SharedComponent />

	<div class="main">
		<p><strong>Interactive</strong></p>

		<input bind:value />
	</div>
</div>

<style>
	.main {
		margin: 1em;
	}

	input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.35em 0.5em;
		background: #eee;
		margin-top: 5px;
		width: 100%;
	}
</style>
