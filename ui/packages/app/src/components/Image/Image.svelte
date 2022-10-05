<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Image, StaticImage } from "@gradio/image";
	import { Block } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";

	import { _ } from "svelte-i18n";
	import { Component as StatusTracker } from "../StatusTracker/";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: null | string | FileData = null;
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";
	export let label: string;
	export let root: string;
	export let show_label: boolean;
	export let streaming: boolean;
	export let pending: boolean;
	export let style: Styles = {};
	export let mirror_webcam: boolean;

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
	let dragging: boolean;

	$: value = !value ? null : value;
	let _value: null | FileData;
	$: _value = normalise_file(value, root);
</script>

<Block
	{visible}
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	{elem_id}
	style={{ height: style.height, width: style.width }}
>
	<StatusTracker {...loading_status} />
	{#if mode === "static"}
		<StaticImage value={_value?.data} {label} {show_label} />
	{:else}
		<Image
			bind:value
			{source}
			{tool}
			on:edit
			on:clear
			on:change
			on:stream
			on:drag={({ detail }) => (dragging = detail)}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				loading_status.message = detail;
			}}
			{label}
			{show_label}
			{pending}
			{streaming}
			drop_text={$_("interface.drop_image")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
			{mirror_webcam}
		/>
	{/if}
</Block>
