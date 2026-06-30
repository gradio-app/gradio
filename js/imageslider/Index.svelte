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

	let fullscreen = $state(false);
	let dragging = $state(false);
	let active_source: sources = $state(null);
	let value = $state(gradio.props.value ?? [null, null]);

	let normalised_slider_position = $derived(
		Math.max(0, Math.min(100, gradio.props.slider_position)) / 100
	);

	gradio.watch_for_change();

	$effect(() => {
		value = gradio.props.value ?? [null, null];
	});

	$effect(() => {
		gradio.props.value = value;
	});
</script>

{#if !gradio.shared.interactive || (value?.[1] && value?.[0])}
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
			onclear={() => {
				gradio.dispatch("clear");
				gradio.dispatch("input");
			}}
			onfullscreen={(detail) => {
				fullscreen = detail;
			}}
			{fullscreen}
			interactive={gradio.shared.interactive}
			bind:value
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			show_download_button={gradio.props.buttons.some(
				(btn) => typeof btn === "string" && btn === "download"
			)}
			i18n={gradio.i18n}
			show_fullscreen_button={gradio.props.buttons.some(
				(btn) => typeof btn === "string" && btn === "fullscreen"
			)}
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
			position={normalised_slider_position}
			slider_color={gradio.props.slider_color}
			max_height={gradio.props.max_height}
		/>
	</Block>
{:else}
	<Block
		visible={gradio.shared.visible}
		variant={value?.[0] || value?.[1] ? "solid" : "dashed"}
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
			bind:value
			bind:dragging
			root={gradio.shared.root}
			onclear={() => {
				gradio.dispatch("clear");
				gradio.dispatch("input");
			}}
			ondrag={(detail) => (dragging = detail)}
			onupload={() => {
				gradio.dispatch("upload");
				gradio.dispatch("input");
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
