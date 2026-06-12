<script lang="ts">
	import { BlockLabel, Empty, IconButtonWrapper } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import FilePreview from "./FilePreview.svelte";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";
	import type { FileData } from "@gradio/client";
	import type { I18nFormatter, SelectData } from "@gradio/utils";

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
	}: {
		value: FileData | FileData[] | null;
		label?: string | null;
		show_label?: boolean;
		selectable?: boolean;
		i18n: I18nFormatter;
		height?: number | string | null;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		on_select?: (event_data: SelectData) => void;
		on_download?: (event_data: FileData) => void;
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
		onselect={on_select}
		ondownload={on_download}
		{value}
		height={height ?? undefined}
	/>
{:else}
	<Empty unpadded_box={true} size="large"><File /></Empty>
{/if}
