<script>
	// @ts-nocheck
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import SpaceRow from "../helpers/SpaceRow.svelte";

	const spacingTokens = [
		{ tokenName: "--spacing-xxs", value: "1px" },
		{ tokenName: "--spacing-xs", value: "2px" },
		{ tokenName: "--spacing-sm", value: "4px" },
		{ tokenName: "--spacing-md", value: "6px" },
		{ tokenName: "--spacing-lg", value: "8px" },
		{ tokenName: "--spacing-xl", value: "10px" },
		{ tokenName: "--spacing-xxl", value: "16px" }
	];
</script>

<Meta title="Design System/Spacing" />

<Story name="Spacing">
	<div class="wrapper">
		<section>
			<h1>Spacing</h1>
		</section>
		<div class="container">
			<table>
				<thead>
					<tr>
						<th>Token Name</th>
						<th>Value</th>
						<th>Example</th>
					</tr>
				</thead>

				{#each spacingTokens as space}
					<SpaceRow {space} />
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
