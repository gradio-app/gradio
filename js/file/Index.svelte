<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as FilePreview } from "./shared/FilePreview.svelte";
	export { default as BaseFileUpload } from "./shared/FileUpload.svelte";
	export { default as BaseFile } from "./shared/File.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import File from "./shared/File.svelte";
	import FileUpload from "./shared/FileUpload.svelte";
	import type { FileData } from "@gradio/client";
	import { Block, UploadText } from "@gradio/atoms";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData | FileData[];

	export let interactive: boolean;
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let height: number | undefined = undefined;

	export let _selectable = false;
	export let loading_status: LoadingStatus;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
		error: string;
		upload: never;
		clear: never;
		select: SelectData;
		clear_status: LoadingStatus;
		delete: FileData;
	}>;
	export let file_count: "single" | "multiple" | "directory";
	export let file_types: string[] = ["file"];

	let old_value = value;
	$: if (JSON.stringify(old_value) !== JSON.stringify(value)) {
		gradio.dispatch("change");
		old_value = value;
	}

	let dragging = false;
	let pending_upload = false;
</script>

<Block
	{visible}
	variant={value ? "solid" : "dashed"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	allow_overflow={false}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		status={pending_upload
			? "generating"
			: loading_status?.status || "complete"}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	{#if !interactive}
		<File
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			selectable={_selectable}
			{value}
			{label}
			{show_label}
			{height}
			i18n={gradio.i18n}
		/>
	{:else}
		<FileUpload
			upload={gradio.client.upload}
			stream_handler={gradio.client.stream}
			{label}
			{show_label}
			{value}
			{file_count}
			{file_types}
			selectable={_selectable}
			{root}
			{height}
			max_file_size={gradio.max_file_size}
			on:change={({ detail }) => {
				value = detail;
			}}
			on:drag={({ detail }) => (dragging = detail)}
			on:clear={() => gradio.dispatch("clear")}
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:delete={({ detail }) => {
				gradio.dispatch("delete", detail);
			}}
			i18n={gradio.i18n}
		>
			<UploadText i18n={gradio.i18n} type="file" />
		</FileUpload>
	{/if}
</Block>
