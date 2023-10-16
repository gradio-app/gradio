<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { getContext } from "svelte";
	import FileUpload from "./FileUpload.svelte";
	import { blobToBase64 } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { UploadText } from "@gradio/atoms";
	import { upload_files as default_upload_files } from "@gradio/client";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import type { S } from "@storybook/theming/dist/create-c2b2ce6d";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData | FileData[];
	let old_value: null | FileData | FileData[];

	export let mode: "static" | "interactive";
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let file_count: string;
	export let file_types: string[] = ["file"];
	export let root_url: null | string;
	export let selectable = false;
	export let loading_status: LoadingStatus;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
		error: string;
		upload: never;
		clear: never;
		select: SelectData;
	}>;

	const upload_files =
		getContext<typeof default_upload_files>("upload_files") ??
		default_upload_files;

	$: _value = normalise_file(value, root, root_url);

	let dragging = false;
	let pending_upload = false;

	$: {
		if (JSON.stringify(_value) !== JSON.stringify(old_value)) {
			old_value = _value;
			if (_value === null) {
				gradio.dispatch("change");
				pending_upload = false;
			} else if (
				!(Array.isArray(_value) ? _value : [_value]).every(
					(file_data) => file_data.blob
				)
			) {
				pending_upload = false;
				gradio.dispatch("change");
			} else if (mode === "interactive") {
				let files = (Array.isArray(_value) ? _value : [_value]).map(
					(file_data) => file_data.blob!
				);
				let upload_value = _value;
				pending_upload = true;
				upload_files(root, files).then((response) => {
					if (upload_value !== _value) {
						// value has changed since upload started
						return;
					}

					pending_upload = false;
					if (response.error) {
						(Array.isArray(_value) ? _value : [_value]).forEach(
							async (file_data, i) => {
								file_data.data = await blobToBase64(file_data.blob!);
								file_data.blob = undefined;
							}
						);
					} else {
						(Array.isArray(_value) ? _value : [_value]).forEach(
							(file_data, i) => {
								if (response.files) {
									file_data.orig_name = file_data.name;
									file_data.name = response.files[i];
									file_data.is_file = true;
									file_data.blob = undefined;
								}
							}
						);
						old_value = _value = normalise_file(value, root, root_url);
					}
					gradio.dispatch("change");
					gradio.dispatch("upload");
				});
			}
		}
	}
</script>

<Block
	{visible}
	variant={value === null ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	{height}
	allow_overflow={false}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		status={pending_upload
			? "generating"
			: loading_status?.status || "complete"}
	/>

	<FileUpload
		{label}
		{show_label}
		value={_value}
		{file_count}
		{file_types}
		{selectable}
		{root}
		{height}
		on:change={({ detail }) => (value = detail)}
		on:drag={({ detail }) => (dragging = detail)}
		on:clear={() => gradio.dispatch("clear")}
		on:select={({ detail }) => gradio.dispatch("select", detail)}
		i18n={gradio.i18n}
	>
		<UploadText i18n={gradio.i18n} type="file" />
	</FileUpload>
</Block>
