<script>
	import Header from "./Header.svelte";
	import "../app.css";
	import "../theme.css";

	import "../../../theme/src/reset.css";
	import "../../../theme/src/global.css";

	import "../../../theme/src/pollen.css";
	// import "../theme/src/tokens.css";
	import "../../../theme/src/typography.css";
</script>

<div class="app">
	<Header />

	<slot />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
