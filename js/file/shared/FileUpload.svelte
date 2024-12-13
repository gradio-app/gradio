<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import { BlockLabel, IconButtonWrapper, IconButton } from "@gradio/atoms";
	import { File, Clear, Upload as UploadIcon } from "@gradio/icons";

	import FilePreview from "./FilePreview.svelte";
	import type { I18nFormatter } from "@gradio/utils";

	export let value: null | FileData | FileData[];

	export let label: string;
	export let show_label = true;
	export let file_count: "single" | "multiple" | "directory" = "single";
	export let file_types: string[] | null = null;
	export let selectable = false;
	export let root: string;
	export let height: number | undefined = undefined;
	export let i18n: I18nFormatter;
	export let max_file_size: number | null = null;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let uploading = false;

	async function handle_upload({
		detail
	}: CustomEvent<FileData | FileData[]>): Promise<void> {
		if (Array.isArray(value)) {
			value = [...value, ...(Array.isArray(detail) ? detail : [detail])];
		} else if (value) {
			value = [value, ...(Array.isArray(detail) ? detail : [detail])];
		} else {
			value = detail;
		}
		await tick();
		dispatch("change", value);
		dispatch("upload", detail);
	}

	function handle_clear(): void {
		value = null;
		dispatch("change", null);
		dispatch("clear");
	}

	const dispatch = createEventDispatcher<{
		change: FileData[] | FileData | null;
		clear: undefined;
		drag: boolean;
		upload: FileData[] | FileData;
		load: FileData[] | FileData;
		error: string;
	}>();

	let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={File} float={!value} label={label || "File"} />

{#if value && (Array.isArray(value) ? value.length > 0 : true)}
	<IconButtonWrapper>
		{#if !(file_count === "single" && (Array.isArray(value) ? value.length > 0 : value !== null))}
			<IconButton Icon={UploadIcon} label={i18n("common.upload")}>
				<Upload
					icon_upload={true}
					on:load={handle_upload}
					filetype={file_types}
					{file_count}
					{max_file_size}
					{root}
					bind:dragging
					bind:uploading
					on:error
					{stream_handler}
					{upload}
				/>
			</IconButton>
		{/if}
		<IconButton
			Icon={Clear}
			label={i18n("common.clear")}
			on:click={(event) => {
				dispatch("clear");
				event.stopPropagation();
				handle_clear();
			}}
		/>
	</IconButtonWrapper>

	<FilePreview
		{i18n}
		on:select
		{selectable}
		{value}
		{height}
		on:change
		on:delete
	/>
{:else}
	<Upload
		on:load={handle_upload}
		filetype={file_types}
		{file_count}
		{max_file_size}
		{root}
		bind:dragging
		bind:uploading
		on:error
		{stream_handler}
		{upload}
	>
		<slot />
	</Upload>
{/if}
