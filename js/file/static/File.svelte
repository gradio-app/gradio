<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BlockLabel, Empty } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import { FilePreview } from "../shared";

	export let value: FileData | FileData[] | null = null;
	export let label: string;
	export let show_label = true;
	export let selectable = false;
	export let height: number | undefined = undefined;
</script>

<BlockLabel
	{show_label}
	float={value === null}
	Icon={File}
	label={label || "File"}
/>

{#if value}
	<FilePreview {selectable} on:select {value} {height} />
{:else}
	<Empty unpadded_box={true} size="large"><File /></Empty>
{/if}
