<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData, ShareData } from "@gradio/utils";
	import Image from "./Image.svelte";

	import { Block } from "@gradio/atoms";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { UploadText } from "@gradio/atoms";
	import type { FileData } from "js/upload/src";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" | "sketch" | "color-sketch" = "editor";
	export let label: string;
	export let show_label: boolean;
	export let streaming: boolean;
	export let pending: boolean;
	export let height: number | undefined;
	export let width: number | undefined;
	export let mirror_webcam: boolean;
	export let shape: [number, number];
	export let brush_radius: number;
	export let brush_color: string;
	export let mask_opacity: number;
	export let selectable = false;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let root: string;

	export let gradio: Gradio<{
		change: never;
		error: string;
		edit: never;
		stream: never;
		drag: never;
		upload: never;
		clear: never;
		select: SelectData;
		share: ShareData;
	}>;

	$: value, gradio.dispatch("change");
	let dragging: boolean;
	const FIXED_HEIGHT = 240;

	$: value = !value ? null : value;
</script>

<Block
	{visible}
	variant={value === null && source === "upload" ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	height={height || (source === "webcam" ? undefined : FIXED_HEIGHT)}
	{width}
	allow_overflow={false}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<Image
		{brush_radius}
		{brush_color}
		{shape}
		bind:value
		{source}
		{tool}
		{selectable}
		{mask_opacity}
		{root}
		on:edit={() => gradio.dispatch("edit")}
		on:clear={() => gradio.dispatch("clear")}
		on:stream={() => gradio.dispatch("stream")}
		on:drag={({ detail }) => (dragging = detail)}
		on:upload={() => gradio.dispatch("upload")}
		on:select={({ detail }) => gradio.dispatch("select", detail)}
		on:share={({ detail }) => gradio.dispatch("share", detail)}
		on:error={({ detail }) => {
			loading_status = loading_status || {};
			loading_status.status = "error";
			gradio.dispatch("error", detail);
		}}
		{label}
		{show_label}
		{pending}
		{streaming}
		{mirror_webcam}
		i18n={gradio.i18n}
	>
		<UploadText i18n={gradio.i18n} type="image" />
	</Image>
</Block>
