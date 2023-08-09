<script lang="ts">
	import RichTextBox from "../shared";
	import { createEventDispatcher, getContext, tick } from "svelte";
	import { upload_files as default_upload_files } from "@gradio/client";
	import type { FileData } from "@gradio/upload";
	import { blobToBase64 } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let label: string = "Textbox";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: {
		text: string | null;
		files: string[] | FileData[];
	} = { text: null, files: [] };
	export let lines: number;
	export let placeholder: string = "";
	export let show_label: boolean;
	export let max_lines: number;
	export let container: boolean = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let show_copy_button: boolean = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let rtl = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autofocus: boolean = false;
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;

	const upload_files =
		getContext<typeof default_upload_files>("upload_files") ??
		default_upload_files;

	async function handle_upload({
		detail
	}: CustomEvent<{
		text: string | null;
		files: string[] | FileData[];
	}>) {
		value = detail;
		value.files = value.files as FileData[];
		await tick();
		let files = value.files.map((file_data) => file_data.blob!);
		upload_files(root, files).then(async (response) => {
			if (response.error) {
				(Array.isArray(detail) ? detail : [detail]).forEach(
					async (file_data, i) => {
						file_data.data = await blobToBase64(file_data.blob!);
						file_data.blob = undefined;
					}
				);
			} else {
				detail.files = detail.files as FileData[];
				(Array.isArray(detail.files) ? detail.files : [detail.files]).forEach(
					(file_data, i) => {
						if (response.files) {
							file_data.orig_name = file_data.name;
							file_data.name = response.files[i];
							file_data.is_file = true;
							file_data.blob = undefined;
						}
					}
				);
			}
			dispatch("change");
			dispatch("upload");
		});
	}

	const dispatch = createEventDispatcher<{
		change: undefined;
		upload: undefined;
	}>();

	$: value = !value ? { text: null, files: [] } : value;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={container}
>
	{#if loading_status}
		<StatusTracker {...loading_status} />
	{/if}

	<RichTextBox
		{value}
		{label}
		{info}
		{show_label}
		{lines}
		{rtl}
		{text_align}
		max_lines={!max_lines ? lines + 1 : max_lines}
		{placeholder}
		{show_copy_button}
		{autofocus}
		{container}
		{file_count}
		{file_types}
		on:change
		on:input
		on:submit
		on:blur
		on:select
		on:load={handle_upload}
		disabled
	></RichTextBox>
</Block>
