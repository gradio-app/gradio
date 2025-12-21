<script context="module">
	import { Story } from "@storybook/addon-svelte-csf";
	import RadiusRow from "../helpers/RadiusRow.svelte";

	export const meta = {
		title: "Design System/Radius"
	};

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
				<tbody>
					{#each radiiTokens as radius}
						<RadiusRow {radius} />
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</Story>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--font-sans, system-ui, sans-serif);
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

	th {
		text-align: left;
		color: #374151;
		font-weight: 600;
	}
</style>
