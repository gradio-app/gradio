<script lang="ts">
	import { BlockLabel, Empty } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import FilePreview from "./FilePreview.svelte";

	let { value, label, show_label, selectable, i18n, height, on_select, on_download } = $props();
</script>

<BlockLabel
	{show_label}
	float={value === null}
	Icon={File}
	label={label || "File"}
/>

{#if value && (Array.isArray(value) ? value.length > 0 : true)}
	<FilePreview {i18n} {selectable} on:select={on_select} on:download={on_download} {value} {height} />
{:else}
	<Empty unpadded_box={true} size="large"><File /></Empty>
{/if}
