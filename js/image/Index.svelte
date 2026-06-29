<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as Webcam } from "./shared/Webcam.svelte";
	export { default as BaseImageUploader } from "./shared/ImageUploader.svelte";
	export { default as BaseStaticImage } from "./shared/ImagePreview.svelte";
	export { default as BaseExample } from "./Example.svelte";
	export { default as BaseImage } from "./shared/Image.svelte";
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { Gradio } from "@gradio/utils";
	import StaticImage from "./shared/ImagePreview.svelte";
	import ImageUploader from "./shared/ImageUploader.svelte";
	import { Block, Empty, UploadText } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { ImageProps, ImageEvents } from "./shared/types";

	let stream_data = { value: null };
	let upload_promise = $state<Promise<any> | null>(null);
	class ImageGradio extends Gradio<ImageEvents, ImageProps> {
		async get_data() {
			if (upload_promise) {
				await upload_promise;
				await tick();
			}

			const data = await super.get_data();
			if (props.props.streaming) {
				data.value = stream_data.value;
			}

			return data;
		}
	}

	const props = $props();
	const gradio = new ImageGradio(props, { value: null });

	let value = $state(gradio.props.value ?? null);
	let fullscreen = $state(false);
	let dragging = $state(false);
	let active_source = $derived.by(() =>
		gradio.props.sources ? gradio.props.sources[0] : null
	);

	$effect(() => {
		value = gradio.props.value ?? null;
	});

	$effect(() => {
		gradio.props.value = value;
	});

	let old_value = value;
	let mounted = false;

	$effect(() => {
		if (!mounted) {
			old_value = value;
			mounted = true;
			return;
		}
		if (old_value !== value) {
			old_value = value;
			gradio.dispatch("change");
		}
	});

	let status = $derived(gradio?.shared?.loading_status.stream_state);
</script>

{#if !gradio.shared.interactive}
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
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
		<StaticImage
			onselect={(detail) => gradio.dispatch("select", detail)}
			onshare={(detail) => gradio.dispatch("share", detail)}
			onerror={(detail) => gradio.dispatch("error", detail)}
			onfullscreen={(detail) => {
				fullscreen = detail;
			}}
			{fullscreen}
			{value}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			selectable={gradio.props._selectable}
			i18n={gradio.i18n}
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
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
		bind:fullscreen
	>
		{#if gradio.shared.loading_status.type === "output" || gradio.shared.loading_status.validation_error}
			<StatusTracker
				autoscroll={gradio.shared.autoscroll}
				i18n={gradio.i18n}
				{...gradio.shared.loading_status}
				on_clear_status={() =>
					gradio.dispatch("clear_status", gradio.shared.loading_status)}
			/>
		{/if}
		<ImageUploader
			bind:upload_promise
			bind:active_source
			bind:value
			bind:dragging
			selectable={gradio.props._selectable}
			root={gradio.shared.root}
			sources={gradio.props.sources}
			{fullscreen}
			show_fullscreen_button={gradio.props.buttons === null
				? true
				: gradio.props.buttons.some(
						(btn) => typeof btn === "string" && btn === "fullscreen"
					)}
			onclear={() => {
				fullscreen = false;
				gradio.dispatch("clear");
				gradio.dispatch("input");
			}}
			onstream={(detail) => {
				stream_data = detail;
				gradio.dispatch("stream", detail);
			}}
			ondrag={(detail) => (dragging = detail)}
			onupload={() => {
				gradio.dispatch("upload");
				gradio.dispatch("input");
			}}
			onselect={(detail) => gradio.dispatch("select", detail)}
			onerror={(detail) => {
				gradio.shared.loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			onclose_stream={() => {
				gradio.dispatch("close_stream");
			}}
			onfullscreen={(detail) => {
				fullscreen = detail;
			}}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			pending={gradio.shared.loading_status?.status === "pending" ||
				gradio.shared.loading_status?.status === "streaming"}
			streaming={gradio.props.streaming}
			webcam_options={gradio.props.webcam_options}
			stream_every={gradio.props.stream_every}
			time_limit={gradio.shared.loading_status?.time_limit}
			max_file_size={gradio.shared.max_file_size}
			i18n={gradio.i18n}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={gradio.shared.client?.stream}
			stream_state={status}
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
