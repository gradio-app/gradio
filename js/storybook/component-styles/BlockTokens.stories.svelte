<script>
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import TokenRow from "../helpers/TokenRow.svelte";

	const tokens = [
		{
			tokenName: "--block-background-fill",
			value: "var(--background-fill-primary)",
		},
		{ tokenName: "--block-border-color", value: "var(--border-color-primary)" },
		{ tokenName: "--block-border-width", value: "1px" },
		{
			tokenName: "--block-info-text-color",
			value: "var(--body-text-color-subdued)",
		},
		{ tokenName: "--block-info-text-size", value: "var(--text-sm)" },
		{ tokenName: "--block-info-text-weight", value: "400" },
		{
			tokenName: "--block-label-background-fill",
			value: "var(--background-fill-primary)",
		},
		{
			tokenName: "--block-label-border-color",
			value: "var(--border-color-primary)",
		},
		{ tokenName: "--block-label-border-width", value: "1px" },
		{ tokenName: "--block-label-shadow", value: "var(--block-shadow)" },
		{ tokenName: "--block-label-text-color", value: "var(--neutral-500)" },
		{ tokenName: "--block-label-margin", value: "0" },
		{
			tokenName: "--block-label-padding",
			value: "var(--spacing-sm) var(--spacing-lg)",
		},
		{
			tokenName: "--block-label-radius",
			value: "calc(var(--radius-lg) - 1px) 0 calc(var(--radius-lg) - 1px) 0",
		},
		{
			tokenName: "--block-label-right-radius",
			value: "0 calc(var(--radius-lg) - 1px) 0 calc(var(--radius-lg) - 1px)",
		},
		{ tokenName: "--block-label-text-size", value: "var(--text-sm)" },
		{ tokenName: "--block-label-text-weight", value: "400" },
		{
			tokenName: "--block-padding",
			value: "var(--spacing-xl) calc(var(--spacing-xl) + 2px)",
		},
		{ tokenName: "--block-radius", value: "var(--radius-lg)" },
		{ tokenName: "--block-shadow", value: "var(--shadow-drop)" },
		{ tokenName: "--block-title-background-fill", value: "none" },
		{ tokenName: "--block-title-border-color", value: "none" },
		{ tokenName: "--block-title-border-width", value: "0px" },
		{ tokenName: "--block-title-text-color", value: "var(--neutral-500)" },
		{ tokenName: "--block-title-padding", value: "0" },
		{ tokenName: "--block-title-radius", value: "none" },
		{ tokenName: "--block-title-text-size", value: "var(--text-md)" },
		{ tokenName: "--block-title-text-weight", value: "400" },
	];
</script>

<Meta title="Design System/Blocks" />

<Story name="Blocks">
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
