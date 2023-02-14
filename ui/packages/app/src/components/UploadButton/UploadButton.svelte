<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import type { Styles } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { UploadButton } from "@gradio/upload-button";
	import { upload_files } from "../../api";
	import { _ } from "svelte-i18n";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let label: string;
	export let value: null | FileData;
	export let file_count: string;
	export let file_types: Array<string> = ["file"];
	export let root: string;

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		upload_files(root, [detail.blob!]).then((response) => {
			if (!response.error) {
				detail.orig_name = detail.name;
				detail.name = response.files![0];
				detail.is_file = true;
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
	{style}
	{visible}
	{file_count}
	{file_types}
	on:click
	on:load={handle_upload}
>
	{$_(label)}
</UploadButton>
