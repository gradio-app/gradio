<script lang="ts">
	import { Maximize, Minimize, Copy } from "@gradio/icons";

	export let show_copy_button = true;
	export let show_fullscreen_button = true;
	export let is_fullscreen = false;
	export let data: { value: any }[][] = [];

	function copy_as_csv(): void {
		const csv = data
			.map((row) => row.map((cell) => cell.value).join(","))
			.join("\n");
		navigator.clipboard.writeText(csv);
	}
</script>

{#if show_copy_button || show_fullscreen_button}
	<div class="toolbar">
		{#if show_copy_button}
			<button class="toolbar-button" on:click={copy_as_csv}>
				<Copy />
			</button>
		{/if}
		{#if show_fullscreen_button}
			<button class="toolbar-button" on:click>
				{#if is_fullscreen}
					<Minimize />
				{:else}
					<Maximize />
				{/if}
			</button>
		{/if}
	</div>
{/if}

<style>
	.toolbar {
		display: flex;
		justify-content: flex-end;
		gap: var(--size-1);
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-6);
		height: var(--size-6);
		padding: var(--size-1);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--body-text-color-subdued);
		cursor: pointer;
		transition: all 0.2s;
	}

	.toolbar-button:hover {
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
	}

	.toolbar-button :global(svg) {
		width: var(--size-4);
		height: var(--size-4);
	}
</style>
