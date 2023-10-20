<script lang="ts">
	export let color: { tokenName: string; value: string };

	let copied = false;
</script>

<tr>
	<td class="token-name"><pre>{color.tokenName}</pre></td>
	<td><pre>{color.value}</pre></td>

	<td class="color-button">
		<button
			on:click={() => {
				copied = true;
				navigator.clipboard.writeText(color.tokenName);
				setTimeout(() => {
					copied = false;
				}, 1000);
			}}
			style="background-color: {color.value};"
			><div class="copy-text">
				{copied ? "Copied to clipboard!" : "Copy token"}
			</div>
		</button></td
	>
</tr>

<style>
	.color-button {
		width: 100%;
	}

	.copy-text {
		background-color: rgb(255 255 255 / 68%);
		font-size: 0.8em;
		width: fit-content;
		margin: 0 auto;
		padding: 5px 10px;
		border-radius: 10px;
		color: #374151;
	}

	button {
		border: none;
		width: 100%;
		height: 50px;
		border-radius: 15px;
		cursor: pointer;
	}

	td {
		padding: 10px;
	}
</style>
