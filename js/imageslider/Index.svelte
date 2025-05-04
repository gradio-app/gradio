<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData, ValueData } from "@gradio/utils";
	import StaticImage from "./shared/SliderPreview.svelte";
	import ImageUploader from "./shared/SliderUpload.svelte";
	import { afterUpdate } from "svelte";

	import { Block, Empty, UploadText } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import { type FileData } from "@gradio/client";
	import type { LoadingStatus } from "@gradio/statustracker";

	type sources = "upload" | "webcam" | "clipboard" | null;

	export let value_is_output = false;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [FileData | null, FileData | null] = [null, null];
	let old_value: [FileData | null, FileData | null] = [null, null];
	export let label: string;
	export let show_label: boolean;
	export let show_download_button: boolean;
	export let root: string;
	export let height: number | undefined;
	export let width: number | undefined;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let interactive: boolean;
	export let placeholder: string | undefined = undefined;
	export let show_fullscreen_button: boolean;
	export let input_ready: boolean;
	export let slider_position: number;
	export let upload_count = 1;
	export let slider_color = "var(--border-color-primary)";
	export let max_height: number;
	let uploading = false;

	$: normalised_slider_position =
		Math.max(0, Math.min(100, slider_position)) / 100;

	$: input_ready = !uploading;

	export let gradio: Gradio<{
		input: never;
		change: never;
		error: string;
		edit: never;
		stream: ValueData;
		drag: never;
		upload: never;
		clear: never;
		select: SelectData;
		share: ShareData;
		clear_status: LoadingStatus;
		close_stream: string;
	}>;

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			gradio.dispatch("change");
			if (!value_is_output) {
				gradio.dispatch("input");
			}
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});

	let dragging: boolean;
	let active_source: sources = null;
	let upload_component: ImageUploader;

	const handle_drag_event = (event: Event): void => {
		const drag_event = event as DragEvent;
		drag_event.preventDefault();
		drag_event.stopPropagation();
		if (drag_event.type === "dragenter" || drag_event.type === "dragover") {
			dragging = true;
		} else if (drag_event.type === "dragleave") {
			dragging = false;
		}
	};

	const handle_drop = (event: Event): void => {
		if (interactive) {
			const drop_event = event as DragEvent;
			drop_event.preventDefault();
			drop_event.stopPropagation();
			dragging = false;

			if (upload_component) {
				upload_component.loadFilesFromDrop(drop_event);
			}
		}
	};
</script>

{#if !interactive || (value?.[1] && value?.[0])}
	<Block
		{visible}
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		height={height || undefined}
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
		<StaticImage
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			on:clear={() => gradio.dispatch("clear")}
			{interactive}
			bind:value
			{label}
			{show_label}
			{show_download_button}
			i18n={gradio.i18n}
			{show_fullscreen_button}
			position={normalised_slider_position}
			{slider_color}
			{max_height}
		/>
	</Block>
{:else}
	<Block
		{visible}
		variant={value === null ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		height={height || undefined}
		{width}
		allow_overflow={false}
		{container}
		{scale}
		{min_width}
		on:dragenter={handle_drag_event}
		on:dragleave={handle_drag_event}
		on:dragover={handle_drag_event}
		on:drop={handle_drop}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>

		<ImageUploader
			bind:this={upload_component}
			bind:value
			bind:dragging
			{root}
			on:edit={() => gradio.dispatch("edit")}
			on:clear={() => {
				gradio.dispatch("clear");
			}}
			on:drag={({ detail }) => (dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:close_stream={() => {
				gradio.dispatch("close_stream", "stream");
			}}
			{label}
			{show_label}
			{upload_count}
			max_file_size={gradio.max_file_size}
			i18n={gradio.i18n}
			upload={(...args) => gradio.client.upload(...args)}
			stream_handler={gradio.client?.stream}
			{max_height}
		>
			{#if active_source === "upload" || !active_source}
				<UploadText i18n={gradio.i18n} type="image" {placeholder} />
			{:else if active_source === "clipboard"}
				<UploadText i18n={gradio.i18n} type="clipboard" mode="short" />
			{:else}
				<Empty unpadded_box={true} size="large"><Image /></Empty>
			{/if}
		</ImageUploader>
	</Block>
{/if}
