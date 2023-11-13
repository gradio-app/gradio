<script>
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import TokenRow from "../helpers/TokenRow.svelte";

	const tokens = [
		{ tokenName: "--input-background-fill", value: "white" },
		{
			tokenName: "--input-background-fill-focus",
			value: "var(--secondary-500)",
		},
		{
			tokenName: "--input-background-fill-hover",
			value: "var(--input-background-fill)",
		},
		{ tokenName: "--input-border-color", value: "var(--border-color-primary)" },
		{ tokenName: "--input-border-color-focus", value: "var(--secondary-300)" },
		{
			tokenName: "--input-border-color-hover",
			value: "var(--input-border-color)",
		},
		{ tokenName: "--input-border-width", value: "1px" },
		{ tokenName: "--input-padding", value: "var(--spacing-xl)" },
		{ tokenName: "--input-placeholder-color", value: "var(--neutral-400)" },
		{ tokenName: "--input-radius", value: "var(--radius-lg)" },
		{
			tokenName: "--input-shadow",
			value: "0 0 0 var(--shadow-spread) transparent, var(--shadow-inset)",
		},
		{
			tokenName: "--input-shadow-focus",
			value:
				"0 0 0 var(--shadow-spread) var(--secondary-50), var(--shadow-inset)",
		},
		{ tokenName: "--input-text-size", value: "var(--text-md)" },
		{ tokenName: "--input-text-weight", value: "400" },
	];
</script>

<Meta title="Design System/Input" />

<Story name="Input">
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
