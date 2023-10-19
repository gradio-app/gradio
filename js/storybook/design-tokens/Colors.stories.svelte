<script>
	// @ts-nocheck
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import ColorRow from "../helpers/ColorRow.svelte";

	const colorTokens = [
		{ tokenName: "--primary-50", value: "#fff7ed" },
		{ tokenName: "--primary-100", value: "#ffedd5" },
		{ tokenName: "--primary-200", value: "#fed7aa" },
		{ tokenName: "--primary-300", value: "#fdba74" },
		{ tokenName: "--primary-400", value: "#fb923c" },
		{ tokenName: "--primary-500", value: "#f97316" },
		{ tokenName: "--primary-600", value: "#ea580c" },
		{ tokenName: "--primary-700", value: "#c2410c" },
		{ tokenName: "--primary-800", value: "#9a3412" },
		{ tokenName: "--primary-900", value: "#7c2d12" },
		{ tokenName: "--primary-950", value: "#6c2e12" },
		{ tokenName: "--secondary-50", value: "#eff6ff" },
		{ tokenName: "--secondary-100", value: "#dbeafe" },
		{ tokenName: "--secondary-200", value: "#bfdbfe" },
		{ tokenName: "--secondary-300", value: "#93c5fd" },
		{ tokenName: "--secondary-400", value: "#60a5fa" },
		{ tokenName: "--secondary-500", value: "#3b82f6" },
		{ tokenName: "--secondary-600", value: "#2563eb" },
		{ tokenName: "--secondary-700", value: "#1d4ed8" },
		{ tokenName: "--secondary-800", value: "#1e40af" },
		{ tokenName: "--secondary-900", value: "#1e3a8a" },
		{ tokenName: "--secondary-950", value: "#1d3660" },
		{ tokenName: "--neutral-50", value: "#f9fafb" },
		{ tokenName: "--neutral-100", value: "#f3f4f6" },
		{ tokenName: "--neutral-200", value: "#e5e7eb" },
		{ tokenName: "--neutral-300", value: "#d1d5db" },
		{ tokenName: "--neutral-400", value: "#9ca3af" },
		{ tokenName: "--neutral-500", value: "#6b7280" },
		{ tokenName: "--neutral-600", value: "#4b5563" },
		{ tokenName: "--neutral-700", value: "#374151" },
		{ tokenName: "--neutral-800", value: "#1f2937" },
		{ tokenName: "--neutral-900", value: "#111827" },
		{ tokenName: "--neutral-950", value: "#0b0f19" }
	];
</script>

<Meta title="Design System/Colors" />

<Story name="Colors">
	<div class="wrapper">
		<section>
			<h1>Colors</h1>
		</section>
		<div class="container">
			<table>
				<thead>
					<tr>
						<th>Token Name</th>
						<th>Value</th>
						<th>Swatch</th>
					</tr>
				</thead>

				{#each colorTokens as color}
					<ColorRow {color} />
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
