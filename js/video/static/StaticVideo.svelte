<svelte:options accessors={true} />

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
	import StaticVideo from "./VideoPreview.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";
	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [FileData, FileData | null] | null = null;
	let old_value: [FileData, FileData | null] | null = null;

	export let label: string;
	export let source: "upload" | "webcam";
	export let root: string;
	export let root_url: null | string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let height: number | undefined;
	export let width: number | undefined;

	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let autoplay = false;
	export let show_share_button = true;

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
	{height}
	{width}
	{container}
	{scale}
	{min_width}
	allow_overflow={false}
>
	<StatusTracker {...loading_status} />

	<StaticVideo
		value={_video}
		subtitle={_subtitle}
		{label}
		{show_label}
		{autoplay}
		{show_share_button}
		on:play
		on:pause
		on:stop
		on:share
		on:error
	/>
</Block>
