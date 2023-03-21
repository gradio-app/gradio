<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BlockLabel, Empty } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import FilePreview from "./FilePreview.svelte";

	export let value: FileData | FileData[] | null = null;
	export let label: string;
	export let show_label: boolean = true;
	export let selectable: boolean = false;
</script>

<BlockLabel
	{show_label}
	float={value === null}
	Icon={File}
	label={label || "File"}
/>

{#if value}
	<FilePreview {selectable} on:select {value} />
{:else}
	<Empty size="large" unpadded_box={true}><File /></Empty>
{/if}
