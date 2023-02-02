<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import { Video, StaticVideo } from "@gradio/video";
	import UploadText from "../UploadText.svelte";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: FileData | null | string = null;
	let old_value: FileData | null | string = null;

	export let label: string;
	export let source: string;
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let style: Styles = {};
	export let mirror_webcam: boolean;
	export let include_audio: boolean;

	export let mode: "static" | "dynamic";

	let _value: null | FileData;
	$: _value = normalise_file(value, root_url ?? root);

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
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	{elem_id}
	style={{ height: style.height, width: style.width }}
	allow_overflow={false}
>
	<StatusTracker {...loading_status} />

	{#if mode === "static"}
		<StaticVideo value={_value} {label} {show_label} on:play on:pause />
	{:else}
		<Video
			value={_value}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				loading_status.message = detail;
			}}
			{label}
			{show_label}
			{source}
			{mirror_webcam}
			{include_audio}
			on:clear
			on:play
			on:pause
			on:upload
		>
			<UploadText type="video" />
		</Video>
	{/if}
</Block>
