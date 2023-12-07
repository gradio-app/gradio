<script>
	// @ts-nocheck
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import ShadowRow from "../helpers/ShadowRow.svelte";

	const shadowTokens = [
		{ tokenName: "--shadow-drop", value: "rgba(0,0,0,0.05) 0px 1px 2px 0px" },
		{
			tokenName: "--shadow-drop-lg",
			value: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
		},
		{
			tokenName: "--shadow-inset",
			value: "rgba(0,0,0,0.05) 0px 2px 4px 0px inset"
		},
		{ tokenName: "--shadow-spread", value: "3px" }
	];
</script>

<Meta title="Design System/Shadows" />

<Story name="Shadows">
	<div class="wrapper">
		<section>
			<h1>Shadows</h1>
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

				{#each shadowTokens as token}
					<ShadowRow shadow={token} />
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
