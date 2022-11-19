<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import type { Styles } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { UploadButton } from "@gradio/uploadbutton";
	import { _ } from "svelte-i18n";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let label: string;
	export let value: null | FileData | Array<FileData>;
	export let file_count: string;
	export let file_type: Array<string> = ["file"];

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		dispatch("change", value);
		dispatch("upload", detail);
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
	{file_type}
	on:click
	on:load={handle_upload}
>
	{$_(label)}
</UploadButton>
