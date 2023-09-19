<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import Model3DUpload from "./Model3DUpload.svelte";
	import { Block, UploadText } from "@gradio/atoms";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let root: string;
	export let root_url: null | string;
	export let clear_color: [number, number, number, number];
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		change: typeof value;
		clear: never;
	}>;
	export let zoom_speed = 1;
	export let height: number | undefined = undefined;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];

	let _value: null | FileData;
	$: _value = normalise_file(value, root, root_url);

	let dragging = false;
</script>

<Block
	{visible}
	variant={value === null ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	{height}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<Model3DUpload
		{label}
		{show_label}
		{root}
		{clear_color}
		value={_value}
		{camera_position}
		{zoom_speed}
		on:change={({ detail }) => (value = detail)}
		on:drag={({ detail }) => (dragging = detail)}
		on:change={({ detail }) => gradio.dispatch("change", detail)}
		on:clear={() => gradio.dispatch("clear")}
		i18n={gradio.i18n}
	>
		<UploadText i18n={gradio.i18n} type="file" />
	</Model3DUpload>
</Block>
