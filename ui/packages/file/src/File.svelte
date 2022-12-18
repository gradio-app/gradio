<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import FilePreview from "./FilePreview.svelte";

	export let value: FileData | FileData[] | null = null;
	export let label: string;
	export let show_label: boolean = true;
</script>

<BlockLabel {show_label} Icon={File} label={label || "File"} />

{#if value}
	<div class="file-preview">
		<FilePreview {value} />
	</div>
{:else}
	<div class="empty">
		<div><File /></div>
	</div>
{/if}

<style>
	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--size-full);
		min-height: var(--size-60);
	}

	.empty > div {
		height: var(--size-5);
		color: var(--color-text-subdued);
	}
</style>
