<script lang="ts">
	import { Maximize, Minimize } from "@gradio/icons";

	export let show_fullscreen_button = false;
	export let is_fullscreen = false;
</script>

{#if show_fullscreen_button}
	<div class="toolbar">
		<button class="toolbar-button" on:click>
			{#if is_fullscreen}
				<Minimize />
			{:else}
				<Maximize />
			{/if}
		</button>
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
