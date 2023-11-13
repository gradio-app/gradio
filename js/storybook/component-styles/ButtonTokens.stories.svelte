<script>
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import TokenRow from "../helpers/TokenRow.svelte";

	const tokens = [
		{ tokenName: "--button-border-width", value: "var(--input-border-width)" },
		{
			tokenName: "--button-cancel-background-fill",
			value: "linear-gradient(to bottom right, #fee2e2, #fecaca)",
		},
		{
			tokenName: "--button-cancel-background-fill-hover",
			value: "linear-gradient(to bottom right, #fee2e2, #fee2e2)",
		},
		{ tokenName: "--button-cancel-border-color", value: "#fecaca" },
		{
			tokenName: "--button-cancel-border-color-hover",
			value: "var(--button-cancel-border-color)",
		},
		{ tokenName: "--button-cancel-text-color", value: "#dc2626" },
		{
			tokenName: "--button-cancel-text-color-hover",
			value: "var(--button-cancel-text-color)",
		},
		{
			tokenName: "--button-large-padding",
			value: "var(--spacing-lg) calc(2 * var(--spacing-lg))",
		},
		{ tokenName: "--button-large-radius", value: "var(--radius-lg)" },
		{ tokenName: "--button-large-text-size", value: "var(--text-lg)" },
		{ tokenName: "--button-large-text-weight", value: "600" },
		{
			tokenName: "--button-primary-background-fill",
			value:
				"linear-gradient(to bottom right, var(--primary-100), var(--primary-300))",
		},
		{
			tokenName: "--button-primary-background-fill-hover",
			value:
				"linear-gradient(to bottom right, var(--primary-100), var(--primary-200))",
		},
		{ tokenName: "--button-primary-border-color", value: "var(--primary-200)" },
		{
			tokenName: "--button-primary-border-color-hover",
			value: "var(--button-primary-border-color)",
		},
		{ tokenName: "--button-primary-text-color", value: "var(--primary-600)" },
		{
			tokenName: "--button-primary-text-color-hover",
			value: "var(--button-primary-text-color)",
		},
		{
			tokenName: "--button-secondary-background-fill",
			value:
				"linear-gradient(to bottom right, var(--neutral-100), var(--neutral-200))",
		},
		{
			tokenName: "--button-secondary-background-fill-hover",
			value:
				"linear-gradient(to bottom right, var(--neutral-100), var(--neutral-100))",
		},
		{
			tokenName: "--button-secondary-border-color",
			value: "var(--neutral-200)",
		},
		{
			tokenName: "--button-secondary-border-color-hover",
			value: "var(--button-secondary-border-color)",
		},
		{ tokenName: "--button-secondary-text-color", value: "var(--neutral-700)" },
		{
			tokenName: "--button-secondary-text-color-hover",
			value: "var(--button-secondary-text-color)",
		},
		{ tokenName: "--button-shadow", value: "var(--shadow-drop)" },
		{ tokenName: "--button-shadow-active", value: "var(--shadow-inset)" },
		{ tokenName: "--button-shadow-hover", value: "var(--shadow-drop-lg)" },
		{
			tokenName: "--button-small-padding",
			value: "var(--spacing-sm) calc(2 * var(--spacing-sm))",
		},
		{ tokenName: "--button-small-radius", value: "var(--radius-lg)" },
		{ tokenName: "--button-small-text-size", value: "var(--text-md)" },
		{ tokenName: "--button-small-text-weight", value: "400" },
		{ tokenName: "--button-transition", value: "none" },
	];
</script>

<Meta title="Design System/Button" />

<Story name="Button">
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
