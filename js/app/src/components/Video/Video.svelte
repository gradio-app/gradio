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
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: [FileData, FileData | null] | null = null;
	let old_value: [FileData, FileData | null] | null = null;

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

	let _video: FileData | null = null;
	let _subtitle: FileData | null = null;

	$: {
		if (value != null) {
			_video = normalise_file(value[0], root, root_url);
			_subtitle = normalise_file(value[1], root, root_url);
		} else {
			_video = null;
			_subtitle = null;
		}
	}

	let dragging = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
	}>();

	function handle_change({ detail }: CustomEvent<FileData | null>) {
		if (detail != null) {
			value = [detail, null] as [FileData, FileData | null];
		} else {
			value = null;
		}

		dispatch("change");
	}

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
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
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	style={{ height: style.height, width: style.width }}
	allow_overflow={false}
>
	<StatusTracker {...loading_status} />

	{#if mode === "static"}
		<StaticVideo
			value={_video}
			subtitle={_subtitle}
			{label}
			{show_label}
			on:play
			on:pause
		/>
	{:else}
		<Video
			value={_video}
			subtitle={_subtitle}
			on:change={handle_change}
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
