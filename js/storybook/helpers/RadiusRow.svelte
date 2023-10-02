<script lang="ts">
	export let radius: { tokenName: string; value: string };

	let copied = false;
</script>

<tr>
	<td class="token-name"><pre>{radius.tokenName}</pre></td>
	<td><pre>{radius.value}</pre></td>

	<td class="td-button">
		<button
			on:click={() => {
				copied = true;
				navigator.clipboard.writeText(radius.tokenName);
				setTimeout(() => {
					copied = false;
				}, 1000);
			}}
			style="border-radius: {radius.value};"
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
		background-color: rgb(255 255 255 / 68%);
		font-size: 0.8em;
		width: fit-content;
		margin: 0 auto;
		padding: 5px 10px;
		border-radius: 10px;
		color: #8d9196;
	}

	button {
		border: none;
		width: 100%;
		height: 50px;
		border-radius: 15px;
		cursor: pointer;
		background-color: white;
		border: 3px solid #fb923c;
	}

	td {
		padding: 10px;
	}
</style>
