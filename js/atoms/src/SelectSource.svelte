<script lang="ts">
	import { Microphone, Upload, Webcam, ImagePaste } from "@gradio/icons";

	type source_types = "upload" | "microphone" | "webcam" | "clipboard" | null;

	export let sources: Partial<source_types>[];
	export let active_source: Partial<source_types>;
	export let handle_clear: () => void = () => {};
	export let handle_select: (
		source_type: Partial<source_types>
	) => void = () => {};

	$: unique_sources = [...new Set(sources)];

	async function handle_select_source(
		source: Partial<source_types>
	): Promise<void> {
		handle_clear();
		active_source = source;
		handle_select(source);
	}
</script>

{#if unique_sources.length > 1}
	<span class="source-selection" data-testid="source-select">
		{#if sources.includes("upload")}
			<button
				class="icon"
				class:selected={active_source === "upload" || !active_source}
				aria-label="Upload file"
				on:click={() => handle_select_source("upload")}><Upload /></button
			>
		{/if}

		{#if sources.includes("microphone")}
			<button
				class="icon"
				class:selected={active_source === "microphone"}
				aria-label="Record audio"
				on:click={() => handle_select_source("microphone")}
				><Microphone /></button
			>
		{/if}

		{#if sources.includes("webcam")}
			<button
				class="icon"
				class:selected={active_source === "webcam"}
				aria-label="Capture from camera"
				on:click={() => handle_select_source("webcam")}><Webcam /></button
			>
		{/if}
		{#if sources.includes("clipboard")}
			<button
				class="icon"
				class:selected={active_source === "clipboard"}
				aria-label="Paste from clipboard"
				on:click={() => handle_select_source("clipboard")}
				><ImagePaste /></button
			>
		{/if}
	</span>
{/if}

<style>
	.source-selection {
		display: flex;
		align-items: center;
		justify-content: center;
		border-top: 1px solid var(--border-color-primary);
		width: 95%;
		bottom: 0;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
	}

	.icon {
		width: 22px;
		height: 22px;
		margin: var(--spacing-lg) var(--spacing-xs);
		padding: var(--spacing-xs);
		color: var(--neutral-400);
		border-radius: var(--radius-md);
	}

	.selected {
		color: var(--color-accent);
	}

	.icon:hover,
	.icon:focus {
		color: var(--color-accent);
	}
</style>
