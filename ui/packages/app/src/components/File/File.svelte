<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { File as FileComponent, FileUpload } from "@gradio/file";
	import type { BinaryFileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import UploadText from "../UploadText.svelte";

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
	export let root_url: null | string;

	export let loading_status: LoadingStatus;

	let _value: null | BinaryFileData | Array<BinaryFileData>;
	$: _value = normalise_file(value, root, root_url);

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
		<FileComponent value={_value} {label} {show_label} />
	{/if}
</Block>
