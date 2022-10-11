<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: null | FileData = null;
	export let mode: "static" | "dynamic";
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let file_count: string;

	export let loading_status: LoadingStatus;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);

	let dragging = false;
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
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			on:change
			on:clear
			drop_text={$_("interface.drop_file")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
		/>
	{:else}
		<File value={_value} {label} {show_label} {file_count} />
	{/if}
</Block>
