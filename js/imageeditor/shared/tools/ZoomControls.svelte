<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { ZoomIn, ZoomOut, Redo } from "@gradio/icons";

	export let zoom_in = (): void => {};
	export let zoom_out = (): void => {};
	export let reset_zoom_pan = (): void => {};
</script>

<div class="zoom-controls">
	<button on:click={zoom_in}><IconButton Icon={ZoomIn} size="medium" /></button>
	<button on:click={zoom_out}
		><IconButton Icon={ZoomOut} size="medium" /></button
	>
	<button on:click={reset_zoom_pan}
		><IconButton Icon={Redo} size="medium" /></button
	>
</div>

<style>
	.zoom-controls {
		position: absolute;
		bottom: 0;
		right: 0;
		display: flex;
		align-items: center;
		flex-direction: column;
		border: var(--block-border-color) var(--spacing-xxs) solid;
		border-radius: var(--radius-md);
		margin: var(--spacing-md);
		background-color: var(--block-background-fill);
		margin: var(--spacing-md);
	}

	.zoom-controls button {
		border: none;
		padding: var(--spacing-xxs);
		outline: none;
	}

	.zoom-controls :global(.padded) {
		border: none;
		outline: none;
		box-shadow: none;
		padding: var(--spacing-xxs);
	}
</style>
