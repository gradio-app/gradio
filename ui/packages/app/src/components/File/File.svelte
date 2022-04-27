<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { _ } from "svelte-i18n";

	export let value: null | FileData = null;
	export let default_value: null | FileData = null;
	export let style: string = "";
	export let mode: "static" | "dynamic";
	export let root: string;
	export let label: string;
	export let show_label: boolean;

	export let loading_status: "complete" | "pending" | "error";

	if (default_value) value = default_value;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);

	let dragging = false;

	$: console.log($$props);
</script>

<Block
	variant={mode === "dynamic" && value === null ? "dashed" : "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
>
	<StatusTracker tracked_status={loading_status} />

	{#if mode === "dynamic"}
		<FileUpload
			{label}
			{show_label}
			value={_value}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			{style}
			on:change
			on:clear
			drop_text={$_("interface.drop_file")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
		/>
	{:else}
		<File value={_value} {style} {label} {show_label} />
	{/if}
</Block>
