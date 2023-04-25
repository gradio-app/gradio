<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import type { Styles } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { UploadButton } from "@gradio/upload-button";
	import { upload_files } from "@gradio/client";
	import { blobToBase64 } from "@gradio/upload";
	import { _ } from "svelte-i18n";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let label: string;
	export let value: null | FileData;
	export let file_count: string;
	export let file_types: Array<string> = ["file"];
	export let root: string;

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		let files = (Array.isArray(detail) ? detail : [detail]).map(
			(file_data) => file_data.blob!
		);

		upload_files(root, files).then(async (response) => {
			if (response.error) {
				(Array.isArray(detail) ? detail : [detail]).forEach(
					async (file_data, i) => {
						file_data.data = await blobToBase64(file_data.blob!);
					}
				);
			} else {
				(Array.isArray(detail) ? detail : [detail]).forEach((file_data, i) => {
					if (response.files) {
						file_data.orig_name = file_data.name;
						file_data.name = response.files[i];
						file_data.is_file = true;
					}
				});
			}

			dispatch("change", value);
			dispatch("upload", detail);
		});
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		upload: FileData;
	}>();
</script>

<UploadButton
	{elem_id}
	{elem_classes}
	{style}
	{visible}
	{file_count}
	{file_types}
	on:click
	on:load={handle_upload}
>
	{$_(label)}
</UploadButton>
