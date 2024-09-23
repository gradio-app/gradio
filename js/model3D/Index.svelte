<script context="module" lang="ts">
	export { default as BaseModel3D } from "./shared/Model3D.svelte";
	export { default as BaseModel3DUpload } from "./shared/Model3DUpload.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { FileData } from "@gradio/client";
	import Model3D from "./shared/Model3D.svelte";
	import Model3DUpload from "./shared/Model3DUpload.svelte";
	import { BlockLabel, Block, Empty, UploadText } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let root: string;
	export let display_mode: "solid" | "point_cloud" | "wireframe" = "solid";
	export let clear_color: [number, number, number, number];
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio;
	export let height: number | undefined = undefined;
	export let zoom_speed = 1;
	export let input_ready: boolean;
	let uploading = false;
	$: input_ready = !uploading;
	export let has_change_history = false;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];
	export let interactive: boolean;

	let dragging = false;
	const is_browser = typeof window !== "undefined";
</script>

{#if !interactive}
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
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>

		{#if value && is_browser}
			<Model3D
				{value}
				i18n={gradio.i18n}
				{display_mode}
				{clear_color}
				{label}
				{show_label}
				{camera_position}
				{zoom_speed}
				{has_change_history}
			/>
		{:else}
			<!-- Not ideal but some bugs to work out before we can 
				 make this consistent with other components -->

			<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

			<Empty unpadded_box={true} size="large"><File /></Empty>
		{/if}
	</Block>
{:else}
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
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>

		<Model3DUpload
			{label}
			{show_label}
			{root}
			{display_mode}
			{clear_color}
			{value}
			{camera_position}
			{zoom_speed}
			bind:uploading
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			on:change={({ detail }) => {
				gradio.dispatch("change", detail);
				has_change_history = true;
			}}
			on:clear={() => {
				value = null;
				gradio.dispatch("clear");
			}}
			on:load={({ detail }) => {
				value = detail;
				gradio.dispatch("upload");
			}}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			i18n={gradio.i18n}
			max_file_size={gradio.max_file_size}
			upload={(...args) => gradio.client.upload(...args)}
			stream_handler={(...args) => gradio.client.stream(...args)}
		>
			<UploadText i18n={gradio.i18n} type="file" />
		</Model3DUpload>
	</Block>
{/if}
