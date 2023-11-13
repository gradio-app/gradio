<script>
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import TokenRow from "../helpers/TokenRow.svelte";

	const tokens = [
		{
			tokenName: "--font",
			value: "'Source Sans Pro', 'ui-sans-serif', 'system-ui', sans-serif",
		},
		{
			tokenName: "--font-mono",
			value: "'IBM Plex Mono', 'ui-monospace', 'Consolas', monospace",
		},
		{
			tokenName: "--body-background-fill",
			value: "var(--background-fill-primary)",
		},
		{ tokenName: "--body-text-color", value: "var(--neutral-800)" },
		{ tokenName: "--body-text-size", value: "var(--text-md)" },
		{ tokenName: "--body-text-weight", value: "400" },
		{ tokenName: "--embed-radius", value: "var(--radius-lg)" },
		{ tokenName: "--color-accent", value: "var(--primary-500)" },
		{ tokenName: "--color-accent-soft", value: "var(--primary-50)" },
		{ tokenName: "--background-fill-primary", value: "white" },
		{ tokenName: "--background-fill-secondary", value: "var(--neutral-50)" },
		{ tokenName: "--border-color-accent", value: "var(--primary-300)" },
		{ tokenName: "--link-text-color", value: "var(--secondary-600)" },
		{ tokenName: "--link-text-color-active", value: "var(--secondary-600)" },
		{ tokenName: "--link-text-color-hover", value: "var(--secondary-700)" },
		{ tokenName: "--link-text-color-visited", value: "var(--secondary-500)" },
		{ tokenName: "--body-text-color-subdued", value: "var(--neutral-400)" },
		{ tokenName: "--container-radius", value: "var(--radius-lg)" },
		{ tokenName: "--form-gap-width", value: "1px" },
		{ tokenName: "--layout-gap", value: "var(--spacing-xxl)" },
		{
			tokenName: "--panel-background-fill",
			value: "var(--background-fill-secondary)",
		},
		{ tokenName: "--panel-border-color", value: "var(--border-color-primary)" },
		{ tokenName: "--panel-border-width", value: "0" },
		{ tokenName: "--section-header-text-size", value: "var(--text-md)" },
		{ tokenName: "--section-header-text-weight", value: "400" },
		{ tokenName: "--border-color-accent-subdued", value: "var(--primary-200)" },
		{
			tokenName: "--chatbot-code-background-color",
			value: "var(--neutral-100)",
		},
		{ tokenName: "--loader-color", value: "var(--color-accent)" },
		{ tokenName: "--prose-text-size", value: "var(--text-md)" },
		{ tokenName: "--prose-text-weight", value: "400" },
		{ tokenName: "--prose-header-text-weight", value: "600" },
		{ tokenName: "--slider-color", value: "#2563eb" },
		{
			tokenName: "--stat-background-fill",
			value:
				"linear-gradient(to right, var(--primary-400), var(--primary-200))",
		},
	];
</script>

<Meta title="Design System/Miscellaneous" />

<Story name="Miscellaneous">
	<div class="wrapper">
		<section>
			<h1>Design Token</h1>
		</section>
		<div class="container">
			<table>
				<thead>
					<tr>
						<th>Token Name</th>
						<th>Value</th>
					</tr>
				</thead>

				{#each tokens as token}
					<TokenRow {token} />
				{/each}
			</table>
		</div>
	</div>
</Story>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--font);
	}

	section {
		background: #fb923c;
		height: 50px;
		width: 90%;
		display: flex;
		align-items: center;
		border-radius: 15px;
		padding: 50px;
		margin: 20px;
	}

	section h1 {
		color: white;
		font-weight: 700;
		font-size: 3em;
	}
	.container {
		width: 90%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	table {
		border-collapse: separate;
		width: 100%;
		border-spacing: 2em;
	}

	tr {
		font: var(--font-sans);
		color: var(--block-title-text-color);
		font-weight: var(--block-title-text-weight);
		font-size: var(--block-title-text-size);
	}
</style>
