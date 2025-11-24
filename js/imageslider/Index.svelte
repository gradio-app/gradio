<svelte:options accessors={true} />

<script lang="ts">
	import { tick } from "svelte";
	import type { ImageSliderProps, ImageSliderEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import StaticImage from "./shared/SliderPreview.svelte";
	import ImageUploader from "./shared/SliderUpload.svelte";

	import { Block, Empty, UploadText } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";

	type sources = "upload" | "webcam" | "clipboard" | null;

	let upload_promise = $state<Promise<any>>();

	class ImageSliderGradio extends Gradio<ImageSliderEvents, ImageSliderProps> {
		async get_data() {
			if (upload_promise) {
				await upload_promise;
				await tick();
			}

			const data = await super.get_data();
			return data;
		}
	}

	const props = $props();
	const gradio = new ImageSliderGradio(props);

	let value_is_output = $state(false);
	let old_value = $state(gradio.props.value);
	let fullscreen = $state(false);
	let dragging = $state(false);
	let active_source: sources = $state(null);
	let upload_component: ImageUploader;

	let normalised_slider_position = $derived(
		Math.max(0, Math.min(100, gradio.props.slider_position)) / 100,
	);

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
			if (!value_is_output) {
				gradio.dispatch("input");
			}
		}
	});

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
		if (gradio.shared.interactive) {
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

{#if !gradio.shared.interactive || (gradio.props.value?.[1] && gradio.props.value?.[0])}
	<Block
		visible={gradio.shared.visible}
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		height={gradio.props.height || undefined}
		width={gradio.props.width}
		allow_overflow={false}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
		bind:fullscreen
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
		/>
		<StaticImage
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			on:clear={() => gradio.dispatch("clear")}
			on:fullscreen={({ detail }) => {
				fullscreen = detail;
			}}
			{fullscreen}
			interactive={gradio.shared.interactive}
			bind:value={gradio.props.value}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			show_download_button={gradio.props.buttons.includes("download")}
			i18n={gradio.i18n}
			show_fullscreen_button={gradio.props.buttons.includes("fullscreen")}
			position={normalised_slider_position}
			slider_color={gradio.props.slider_color}
			max_height={gradio.props.max_height}
		/>
	</Block>
{:else}
	<Block
		visible={gradio.shared.visible}
		variant={gradio.props.value === null ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		height={gradio.props.height || undefined}
		width={gradio.props.width}
		allow_overflow={false}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
		on:dragenter={handle_drag_event}
		on:dragleave={handle_drag_event}
		on:dragover={handle_drag_event}
		on:drop={handle_drop}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		<ImageUploader
			bind:upload_promise
			bind:this={upload_component}
			bind:value={gradio.props.value}
			bind:dragging
			root={gradio.shared.root}
			on:edit={() => gradio.dispatch("edit")}
			on:clear={() => {
				gradio.dispatch("clear");
			}}
			on:drag={({ detail }) => (dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:error={({ detail }) => {
				if (gradio.shared.loading_status)
					gradio.shared.loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:close_stream={() => {
				gradio.dispatch("close_stream", "stream");
			}}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			upload_count={gradio.props.upload_count}
			max_file_size={gradio.shared.max_file_size}
			i18n={gradio.i18n}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={gradio.shared.client?.stream}
			max_height={gradio.props.max_height}
		>
			{#if active_source === "upload" || !active_source}
				<UploadText
					i18n={gradio.i18n}
					type="image"
					placeholder={gradio.props.placeholder}
				/>
			{:else if active_source === "clipboard"}
				<UploadText i18n={gradio.i18n} type="clipboard" mode="short" />
			{:else}
				<Empty unpadded_box={true} size="large"><Image /></Empty>
			{/if}
		</ImageUploader>
	</Block>
{/if}
