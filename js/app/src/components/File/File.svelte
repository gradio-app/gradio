<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { File as FileComponent, FileUpload } from "@gradio/file";
	import { blobToBase64, FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import UploadText from "../UploadText.svelte";
	import { upload_files } from "@gradio/client";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: null | FileData | Array<FileData>;
	let old_value: null | FileData | Array<FileData>;

	export let mode: "static" | "dynamic";
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let file_count: string;
	export let file_types: Array<string> = ["file"];
	export let root_url: null | string;
	export let selectable: boolean = false;

	export let loading_status: LoadingStatus;

	$: _value = normalise_file(value, root, root_url);

	let dragging = false;
	let pending_upload = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		error: string;
		upload: undefined;
	}>();

	$: {
		if (JSON.stringify(_value) !== JSON.stringify(old_value)) {
			old_value = _value;
			if (_value === null) {
				dispatch("change");
				pending_upload = false;
			} else if (
				!(Array.isArray(_value) ? _value : [_value]).every(
					(file_data) => file_data.blob
				)
			) {
				pending_upload = false;
			} else if (mode === "dynamic") {
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
							}
						);
					} else {
						(Array.isArray(_value) ? _value : [_value]).forEach(
							(file_data, i) => {
								if (response.files) {
									file_data.orig_name = file_data.name;
									file_data.name = response.files[i];
									file_data.is_file = true;
								}
							}
						);
						_value = normalise_file(value, root, root_url);
					}
					dispatch("change");
					dispatch("upload");
				});
			}
		}
	}
</script>

<Block
	{visible}
	variant={mode === "dynamic" && value === null ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
>
	<StatusTracker
		{...loading_status}
		status={pending_upload
			? "generating"
			: loading_status?.status || "complete"}
	/>

	{#if mode === "dynamic"}
		<FileUpload
			{label}
			{show_label}
			value={_value}
			{file_count}
			{file_types}
			{selectable}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			on:clear
			on:select
		>
			<UploadText type="file" />
		</FileUpload>
	{:else}
		<FileComponent on:select {selectable} value={_value} {label} {show_label} />
	{/if}
</Block>
