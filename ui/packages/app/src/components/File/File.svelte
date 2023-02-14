<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { File as FileComponent, FileUpload } from "@gradio/file";
	import type { BinaryFileData } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import UploadText from "../UploadText.svelte";
	import { upload_files } from "../../api";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: null | BinaryFileData | Array<BinaryFileData>;
	let old_value: null | BinaryFileData | Array<BinaryFileData>;

	export let mode: "static" | "dynamic";
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let file_count: string;
	export let file_types: Array<string> = ["file"];

	export let loading_status: LoadingStatus;

	let dragging = false;
	let pending_upload = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		error: string;
	}>();

	$: {
		if (value !== old_value) {
			old_value = value;
			if (value === null) {
				dispatch("change");
				pending_upload = false;
			} else {
				let files = (Array.isArray(value) ? value : [value]).map(
					(file_data) => file_data.blob
				);
				let upload_value = value;
				pending_upload = true;
				upload_files(root, files).then((response) => {
					if (upload_value !== value) {
						// value has changed since upload started
						return;
					}

					pending_upload = false;
					if (response.error) {
						loading_status.status = "error";
						loading_status.message = response.error;
					} else {
						(Array.isArray(value) ? value : [value]).forEach((file_data, i) => {
							if (response.files) {
								file_data.orig_name = file_data.name;
								file_data.name = response.files[i];
								file_data.is_file = true;
							}
						});
					}
				});
			}
		}
	}
</script>

<Block
	{visible}
	variant={mode === "dynamic" && value === null ? "dashed" : "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	{elem_id}
>
	<StatusTracker
		{...loading_status}
		status={pending_upload ? "generating" : (loading_status?.status || "complete")}
	/>

	{#if mode === "dynamic"}
		<FileUpload
			{label}
			{show_label}
			{value}
			{file_count}
			{file_types}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			on:clear
			on:upload
		>
			<UploadText type="file" />
		</FileUpload>
	{:else}
		<FileComponent {value} {label} {show_label} />
	{/if}
</Block>
