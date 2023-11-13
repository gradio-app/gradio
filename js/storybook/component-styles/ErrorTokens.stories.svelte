<script>
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import TokenRow from "../helpers/TokenRow.svelte";

	const tokens = [
		{ tokenName: "--error-background-fill", value: "#fef2f2" },
		{ tokenName: "--error-border-color", value: "#b91c1c" },
		{ tokenName: "--error-border-width", value: "1px" },
		{ tokenName: "--error-text-color", value: "#b91c1c" },
		{ tokenName: "--error-icon-color", value: "#b91c1c" },
	];
</script>

<Meta title="Design System/Errors" />

<Story name="Errors">
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
