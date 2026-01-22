<script lang="ts">
	import { Microphone, Upload, Webcam, ImagePaste, Video } from "@gradio/icons";

	type source_types =
		| "upload"
		| "microphone"
		| "webcam"
		| "clipboard"
		| "webcam-video"
		| null;

	let {
		sources,
		active_source = $bindable(),
		handle_clear = () => {},
		handle_select = () => {}
	}: {
		sources: Partial<source_types>[];
		active_source?: Partial<source_types>;
		handle_clear?: () => void;
		handle_select?: (source_type: Partial<source_types>) => void;
	} = $props();

	let unique_sources = $derived([...new Set(sources)]);

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
				onclick={() => handle_select_source("upload")}><Upload /></button
			>
		{/if}

		{#if sources.includes("microphone")}
			<button
				class="icon"
				class:selected={active_source === "microphone"}
				aria-label="Record audio"
				onclick={() => handle_select_source("microphone")}
				><Microphone /></button
			>
		{/if}

		{#if sources.includes("webcam")}
			<button
				class="icon"
				class:selected={active_source === "webcam"}
				aria-label="Capture from camera"
				onclick={() => handle_select_source("webcam")}><Webcam /></button
			>
		{/if}
		{#if sources.includes("webcam-video")}
			<button
				class="icon"
				class:selected={active_source === "webcam-video"}
				aria-label="Record video from camera"
				onclick={() => handle_select_source("webcam-video")}><Video /></button
			>
		{/if}
		{#if sources.includes("clipboard")}
			<button
				class="icon"
				class:selected={active_source === "clipboard"}
				aria-label="Paste from clipboard"
				onclick={() => handle_select_source("clipboard")}><ImagePaste /></button
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
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		height: var(--size-10);
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
