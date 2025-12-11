<svelte:options accessors={true} immutable={true} />

<script lang="ts">
	import type { ImageBlobs } from "./InteractiveImageEditor.svelte";

	import { FileData } from "@gradio/client";

	import { BaseStaticImage as StaticImage } from "@gradio/image";
	import InteractiveImageEditor from "./InteractiveImageEditor.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	import { Gradio } from "@gradio/utils";
	import type { ImageEditorEvents, ImageEditorProps } from "./types";

	let props = $props();

	class ImageEditorGradio extends Gradio<ImageEditorEvents, ImageEditorProps> {
		async get_data() {
			const data = await super.get_data();
			const value = await _get_value();
			return { ...data, value: value };
		}
	}
	const gradio = new ImageEditorGradio(props, {
		server: { accept_blobs: () => {} },
		buttons: [],
		height: 350,
		border_region: 0
	});

	let editor_instance: InteractiveImageEditor;
	let image_id: null | string = $state(null);

	let has_run_change = false;
	let has_run_input = false;

	async function _get_value(): Promise<ImageBlobs | { id: string }> {
		if (image_id) {
			const val = { id: image_id };
			image_id = null;
			return val;
		}

		const blobs = await editor_instance.get_data();

		return blobs;
	}

	let is_dragging: boolean;

	const is_browser = typeof window !== "undefined";

	// function handle_change(): void {
	// 	if (gradio.props.value) gradio.dispatch("change");
	// }

	function handle_save(): void {
		gradio.dispatch("apply");
	}

	// function handle_history_change(): void {
	// 	gradio.dispatch("change");

	// 	gradio.dispatch("input");
	// }

	let has_value = $derived(
		gradio.props.value?.background ||
			gradio.props.value?.layers?.length ||
			gradio.props.value?.composite
	);

	let normalised_background = $derived(
		gradio.props.value?.background
			? new FileData(gradio.props.value.background)
			: null
	);
	let normalised_composite = $derived(
		gradio.props.value?.composite
			? new FileData(gradio.props.value.composite)
			: null
	);
	let normalised_layers = $derived(
		gradio.props.value?.layers?.map((layer) => new FileData(layer)) || []
	);
</script>

{#if !gradio.shared.interactive}
	<Block
		visible={gradio.shared.visible}
		variant={"solid"}
		border_mode={is_dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		height={gradio.props.height}
		width={gradio.props.width}
		allow_overflow={true}
		overflow_behavior="visible"
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
		<StaticImage
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			value={gradio.props.value?.composite || null}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			buttons={gradio.props.buttons}
			selectable={gradio.props._selectable}
			i18n={gradio.i18n}
			on_custom_button_click={(id) => {
				gradio.dispatch_to(id, "click", null);
			}}
		/>
	</Block>
{:else}
	<Block
		visible={gradio.shared.visible}
		variant={has_value ? "solid" : "dashed"}
		border_mode={is_dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		height={gradio.props.height}
		width={gradio.props.width}
		allow_overflow={true}
		overflow_behavior="visible"
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

		<InteractiveImageEditor
			border_region={gradio.props.border_region}
			bind:is_dragging
			canvas_size={gradio.props.canvas_size}
			bind:image_id
			layers={normalised_layers}
			composite={normalised_composite}
			background={normalised_background}
			bind:this={editor_instance}
			root={gradio.shared.root}
			sources={gradio.props.sources}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			fixed_canvas={gradio.props.fixed_canvas}
			on:input={() => {
				if (!has_run_input) {
					has_run_input = true;
				} else {
					gradio.dispatch("input");
				}
			}}
			on:save={(e) => handle_save()}
			on:edit={() => gradio.dispatch("edit")}
			on:clear={() => gradio.dispatch("clear")}
			on:drag={({ detail }) => (is_dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => {
				gradio.shared.loading_status = gradio.shared.loading_status || {};
				gradio.shared.loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:receive_null={() =>
				(gradio.props.value = {
					background: null,
					layers: [],
					composite: null
				})}
			on:change={() => {
				if (!has_run_change) {
					has_run_change = true;
				} else {
					gradio.dispatch("change");
				}
			}}
			on:error
			brush={gradio.props.brush}
			eraser={gradio.props.eraser}
			changeable={gradio.shared.attached_events.includes("apply")}
			realtime={gradio.shared.attached_events.includes("change") ||
				gradio.shared.attached_events.includes("input")}
			i18n={gradio.i18n}
			transforms={gradio.props.transforms}
			accept_blobs={gradio.shared.server.accept_blobs}
			layer_options={gradio.props.layers}
			upload={(...args) => gradio.shared.client.upload(...args)}
			placeholder={gradio.props.placeholder}
			webcam_options={gradio.props.webcam_options}
			show_download_button={gradio.props.buttons === null
				? true
				: gradio.props.buttons.some(btn => typeof btn === "string" && btn === "download")}
			theme_mode={gradio.shared.theme_mode}
			on:download_error={(e) => gradio.dispatch("error", e.detail)}
		></InteractiveImageEditor>
	</Block>
{/if}
