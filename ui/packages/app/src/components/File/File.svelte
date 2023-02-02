<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";
	import { normalise_files } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import UploadText from "../UploadText.svelte";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
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

	export let loading_status: LoadingStatus;

	let _value: null | FileData | Array<FileData>;
	$: _value = normalise_files(value, root_url ?? root);

	let dragging = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
	}>();

	$: {
		if (value !== old_value) {
			old_value = value;

			dispatch("change");
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
	<StatusTracker {...loading_status} />

	{#if mode === "dynamic"}
		<FileUpload
			{label}
			{show_label}
			value={_value}
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
		<File value={_value} {label} {show_label} />
	{/if}
</Block>
