<script lang="ts">
	export let space: { tokenName: string; value: string };

	let copied = false;
</script>

<tr>
	<td class="token-name"><pre>{space.tokenName}</pre></td>
	<td><pre>{space.value}</pre></td>

	<td class="td-button">
		<button
			on:click={() => {
				copied = true;
				navigator.clipboard.writeText(space.tokenName);
				setTimeout(() => {
					copied = false;
				}, 1000);
			}}
			style="height: {space.value};"
			><div class="copy-text">
				{copied ? "Copied to clipboard!" : "Copy token"}
			</div>
		</button></td
	>
</tr>

<style>
	.td-button {
		width: 100%;
	}
	.copy-text {
		font-size: 0.8em;
		margin: 15px 0;
		width: max-content;
		color: #8d9196;
	}

	button {
		border: none;
		width: 100%;
		cursor: pointer;
		background-color: #fb923c;
	}

	td {
		padding: 10px 0;
	}
</style>
