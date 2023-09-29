<script lang="ts">
	export let textSize: { tokenName: string; value: string };

	let copied = false;
</script>

<tr>
	<td class="token-name"><pre>{textSize.tokenName}</pre></td>
	<td><pre>{textSize.value}</pre></td>

	<td class="color-button">
		<button
			on:click={() => {
				copied = true;
				navigator.clipboard.writeText(textSize.tokenName);
				setTimeout(() => {
					copied = false;
				}, 1000);
			}}
			><div style="font-size: {textSize.value}">Gradio</div>
		</button>
		<div class="copy-text">
			{copied ? "Copied to clipboard!" : "Click to copy token"}
		</div></td
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
		border-radius: 15px;
		cursor: pointer;
		background-color: white;
		border: 3px solid #fb923c;
		padding: 10px;
	}

	td {
		padding: 10px;
	}
</style>
