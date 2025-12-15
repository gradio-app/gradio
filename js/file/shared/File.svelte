<script lang="ts">
	import { BlockLabel, Empty, IconButtonWrapper } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import FilePreview from "./FilePreview.svelte";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	let {
		value,
		label,
		show_label,
		selectable,
		i18n,
		height,
		buttons = null,
		on_custom_button_click = null,
		on_select,
		on_download
	} = $props();
</script>

{#if show_label && buttons && buttons.length > 0}
	<IconButtonWrapper {buttons} {on_custom_button_click} />
{/if}
<BlockLabel
	{show_label}
	float={value === null}
	Icon={File}
	label={label || "File"}
/>

{#if value && (Array.isArray(value) ? value.length > 0 : true)}
	<FilePreview
		{i18n}
		{selectable}
		on:select={on_select}
		on:download={on_download}
		{value}
		{height}
	/>
{:else}
	<Empty unpadded_box={true} size="large"><File /></Empty>
{/if}
