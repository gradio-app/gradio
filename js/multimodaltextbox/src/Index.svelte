<script lang="ts">
	import { createEventDispatcher, getContext } from "svelte";
	import MultimodalTextbox from "./dynamic";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../../app/src/components/StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../../app/src/components/StatusTracker/types";

	export let label: string = "Textbox";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string = "";
	export let lines: number;
	export let placeholder: string = "";
	export let show_label: boolean;
	export let max_lines: number;
	export let type: "text" | "password" | "email" = "text";
	export let container: boolean = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let show_copy_button: boolean = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let value_is_output: boolean = false;
	export let rtl = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autofocus: boolean = false;
	export let file_count: string;
	export let file_types: string[] = [];

	const upload_files =
		getContext<typeof default_upload_files>("upload_files") ??
		default_upload_files;

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		console.log("handle_upload");
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

			dispatch("change", value);
			dispatch("upload", detail);
		});
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		upload: FileData;
	}>();
	$: console.log("Index Value::: ", value);
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

	<MultimodalTextbox
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		{lines}
		{type}
		{rtl}
		{text_align}
		max_lines={!max_lines && mode === "static" ? lines + 1 : max_lines}
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
		disabled={mode === "static"}
		on:load={handle_upload}
	/>
</Block>
