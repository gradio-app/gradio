<script lang="ts">
	import { formatter } from "../gradio_helper";
	import I18nTestSetup from "./I18nTestSetup.svelte";

	const testStrings = ["share", "submit", "clear", "flag", "error"];
</script>

<I18nTestSetup />

<div class="i18n-multi-language-container">
	<h2>I18n Formatter Test</h2>

	<div class="translation-table">
		<div class="table-header">
			<div class="col">String Key</div>
			<div class="col">Common Key</div>
			<div class="col">Formatted Output</div>
		</div>

		{#each testStrings as str}
			<div class="table-row">
				<div class="col key">{str}</div>
				<div class="col key">common.{str}</div>
				<div class="col result">{formatter(str)}</div>
			</div>
		{/each}
	</div>

	<div class="instructions">
		<h3>Testing</h3>
		Use the&nbsp;<strong>Locale</strong> selector in the toolbar to change languages
		and refresh
	</div>
</div>

<style>
	.i18n-multi-language-container {
		padding: 2rem;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		margin: 1rem;
		max-width: 700px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 600;
	}

	h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.translation-table {
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		overflow: hidden;
		margin-bottom: 1.5rem;
	}

	.table-header {
		display: flex;
		background-color: #f8fafc;
		font-weight: 600;
		border-bottom: 1px solid #e2e8f0;
	}

	.table-row {
		display: flex;
		border-bottom: 1px solid #e2e8f0;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.col {
		padding: 0.75rem 1rem;
		flex: 1;
	}

	.col:not(:last-child) {
		border-right: 1px solid #e2e8f0;
	}

	.key {
		font-family: monospace;
		background-color: #f8fafc;
	}

	.result {
		font-weight: 500;
	}

	.instructions {
		padding: 1rem;
		background-color: #f0f9ff;
		border-radius: 0.5rem;
		font-size: 0.9rem;
	}
</style>
