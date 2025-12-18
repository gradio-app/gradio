<script context="module">
	import { Story } from "@storybook/addon-svelte-csf";
	import TextSizeRow from "../helpers/TextSizeRow.svelte";

	export const meta = {
		title: "Design System/Text Size"
	};

	const textSizes = [
		{ tokenName: "--text-xxs", value: "9px" },
		{ tokenName: "--text-xs", value: "10px" },
		{ tokenName: "--text-sm", value: "12px" },
		{ tokenName: "--text-md", value: "14px" },
		{ tokenName: "--text-lg", value: "16px" },
		{ tokenName: "--text-xl", value: "22px" },
		{ tokenName: "--text-xxl", value: "26px" }
	];
</script>

<Story name="Text Size">
	<div class="wrapper">
		<section>
			<h1>Text Sizing</h1>
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
					{#each textSizes as textSize}
						<TextSizeRow {textSize} />
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
