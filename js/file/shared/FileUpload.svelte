<script lang="ts">
	import { tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import { BlockLabel, IconButtonWrapper, IconButton } from "@gradio/atoms";
	import { File, Clear, Upload as UploadIcon } from "@gradio/icons";

	import FilePreview from "./FilePreview.svelte";
	import type { I18nFormatter, SelectData } from "@gradio/utils";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	let {
		value = $bindable<null | FileData | FileData[]>(),
		label,
		show_label = true,
		file_count = "single",
		file_types = null,
		selectable = false,
		root,
		height = undefined,
		i18n,
		max_file_size = null,
		upload,
		stream_handler,
		uploading = $bindable(false),
		allow_reordering = false,
		upload_promise = $bindable<Promise<(FileData | null)[]> | null>(),
		buttons = null,
		on_custom_button_click = null,
		onchange,
		onclear,
		ondrag,
		onupload,
		onerror,
		ondelete,
		onselect
	}: {
		value: null | FileData | FileData[];
		label: string;
		show_label?: boolean;
		file_count: "single" | "multiple" | "directory";
		file_types: string[] | null;
		selectable?: boolean;
		root: string;
		height?: number | undefined;
		i18n: I18nFormatter;
		max_file_size: number | null;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		uploading?: boolean;
		allow_reordering?: boolean;
		upload_promise?: Promise<(FileData | null)[]> | null;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		onchange?: (event_data: FileData[] | FileData | null) => void;
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onupload?: (event_data: FileData[] | FileData) => void;
		onerror?: (error: string) => void;
		ondelete?: (event_data: FileData) => void;
		onselect?: (event_data: SelectData) => void;
	} = $props();

	async function handle_upload(detail: FileData | FileData[]): Promise<void> {
		if (Array.isArray(value)) {
			value = [...value, ...(Array.isArray(detail) ? detail : [detail])];
		} else if (value) {
			value = [value, ...(Array.isArray(detail) ? detail : [detail])];
		} else {
			value = detail;
		}
		await tick();
		onchange?.(value);
		onupload?.(value);
	}

	function handle_clear(): void {
		value = null;
		onchange?.(null);
		onclear?.();
	}

	let dragging = $state(false);
</script>

{#if show_label && buttons && buttons.length > 0}
	<IconButtonWrapper {buttons} {on_custom_button_click} />
{/if}
<BlockLabel {show_label} Icon={File} float={!value} label={label || "File"} />

{#if value && (Array.isArray(value) ? value.length > 0 : true)}
	<IconButtonWrapper buttons={buttons || []} {on_custom_button_click}>
		{#if !(file_count === "single" && (Array.isArray(value) ? value.length > 0 : value !== null))}
			<IconButton Icon={UploadIcon} label={i18n("common.upload")}>
				<Upload
					bind:upload_promise
					icon_upload={true}
					onload={handle_upload}
					filetype={file_types}
					{file_count}
					{max_file_size}
					{root}
					bind:dragging
					bind:uploading
					{onerror}
					{stream_handler}
					{upload}
				/>
			</IconButton>
		{/if}
		<IconButton
			Icon={Clear}
			label={i18n("common.clear")}
			onclick={(event) => {
				event.stopPropagation();
				handle_clear();
			}}
		/>
	</IconButtonWrapper>

	<FilePreview
		{i18n}
		{onselect}
		{selectable}
		{value}
		{height}
		{onchange}
		{ondelete}
		{allow_reordering}
	/>
{:else}
	<Upload
		bind:upload_promise
		onload={handle_upload}
		filetype={file_types}
		{file_count}
		{max_file_size}
		{root}
		bind:dragging
		bind:uploading
		{onerror}
		{stream_handler}
		{upload}
		{height}
	>
		<slot />
	</Upload>
{/if}
