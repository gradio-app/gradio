<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { getContext, tick } from "svelte";
	import type { FileData } from "@gradio/upload";
	import UploadButton from "../shared";
	import { upload_files as default_upload_files } from "@gradio/client";
	import { blobToBase64 } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label: string;
	export let value: null | FileData;
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let gradio: Gradio<{
		change: FileData | null;
		upload: FileData;
		click: never;
	}>;

	const upload_files =
		getContext<typeof default_upload_files>("upload_files") ??
		default_upload_files;

	async function handle_upload({
		detail
	}: CustomEvent<FileData>): Promise<void> {
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
						file_data.blob = undefined;
					}
				);
			} else {
				(Array.isArray(detail) ? detail : [detail]).forEach((file_data, i) => {
					if (response.files) {
						file_data.orig_name = file_data.name;
						file_data.name = response.files[i];
						file_data.is_file = true;
						file_data.blob = undefined;
					}
				});
			}

			gradio.dispatch("change", value);
			gradio.dispatch("upload", detail);
		});
	}
</script>

<UploadButton
	{elem_id}
	{elem_classes}
	{visible}
	{file_count}
	{file_types}
	{size}
	{scale}
	{min_width}
	{variant}
	{label}
	on:click={() => gradio.dispatch("click")}
	on:load={handle_upload}
>
	{gradio.i18n(label)}
</UploadButton>
