<script lang="ts">
	import { Microphone, Upload, Video } from "@gradio/icons";

	export let sources: string[];
	export let active_source: string;
	export let handle_clear: () => void = () => {};
</script>

{#if sources.length > 1}
	<span class="source-selection" data-testid="source-select">
		{#if sources.includes("upload")}
			<button
				class="icon"
				class:selected={active_source === "upload"}
				aria-label="Upload file"
				on:click={() => {
					handle_clear();
					active_source = "upload";
				}}><Upload /></button
			>
		{/if}

		{#if sources.includes("microphone")}
			<button
				class="icon"
				class:selected={active_source === "microphone"}
				aria-label="Record audio"
				on:click={() => {
					handle_clear();
					active_source = "microphone";
				}}><Microphone /></button
			>
		{/if}

		{#if sources.includes("webcam")}
			<button
				class="icon"
				class:selected={active_source === "webcam"}
				aria-label="Record video"
				on:click={() => {
					handle_clear();
					active_source = "webcam";
				}}><Video /></button
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
		align-self: flex-end;
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
