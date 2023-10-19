<script>
	// @ts-nocheck
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import RadiusRow from "../helpers/RadiusRow.svelte";

	const radiiTokens = [
		{ tokenName: "--radius-xxs", value: "1px" },
		{ tokenName: "--radius-xs", value: "2px" },
		{ tokenName: "--radius-sm", value: "4px" },
		{ tokenName: "--radius-md", value: "6px" },
		{ tokenName: "--radius-lg", value: "8px" },
		{ tokenName: "--radius-xl", value: "12px" },
		{ tokenName: "--radius-xxl", value: "22px" }
	];
</script>

<Meta title="Design System/Radius" />

<Story name="Radius">
	<div class="wrapper">
		<section>
			<h1>Radii</h1>
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

				{#each radiiTokens as radius}
					<RadiusRow {radius} />
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
		margin: 10px;
		font: var(--font-sans);
		color: var(--block-title-text-color);
		font-weight: var(--block-title-text-weight);
		font-size: var(--block-title-text-size);
	}
</style>
