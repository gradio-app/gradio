<script context="module" lang="ts">
	export { default as BaseModel3D } from "./shared/Model3D.svelte";
	export { default as BaseModel3DUpload } from "./shared/Model3DUpload.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { tick } from "svelte";
	import type { Model3DProps, Model3DEvents } from "./types";
	import type { FileData } from "@gradio/client";
	import { Gradio } from "@gradio/utils";
	import Model3D from "./shared/Model3D.svelte";
	import Model3DUpload from "./shared/Model3DUpload.svelte";
	import { BlockLabel, Block, Empty, UploadText, IconButtonWrapper } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";

	class Model3dGradio extends Gradio<Model3DEvents, Model3DProps> {
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
	const gradio = new Model3dGradio(props);

	let old_value = $state(gradio.props.value);
	let uploading = $state(false);
	let dragging = $state(false);
	let has_change_history = $state(false);
	let upload_promise = $state<Promise<any>>();

	const is_browser = typeof window !== "undefined";

	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	function handle_change(detail: FileData | null) {
		gradio.props.value = detail;
		gradio.dispatch("change", detail);
		has_change_history = true;
	}

	function handle_drag(detail: boolean) {
		dragging = detail;
	}

	function handle_clear() {
		gradio.props.value = null;
		gradio.dispatch("clear");
	}

	function handle_load(detail: FileData) {
		gradio.props.value = detail;
		gradio.dispatch("upload");
	}

	function handle_error(detail: string) {
		if (gradio.shared.loading_status)
			gradio.shared.loading_status.status = "error";
		gradio.dispatch("error", detail);
	}
</script>

{#if !gradio.shared.interactive}
	<Block
		visible={gradio.shared.visible}
		variant={gradio.props.value === null ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
		height={gradio.props.height}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		{#if gradio.props.value && is_browser}
			<Model3D
				value={gradio.props.value}
				i18n={gradio.i18n}
				display_mode={gradio.props.display_mode}
				clear_color={gradio.props.clear_color}
				label={gradio.shared.label}
				show_label={gradio.shared.show_label}
				camera_position={gradio.props.camera_position}
				zoom_speed={gradio.props.zoom_speed}
				{has_change_history}
			/>
		{:else}
			{#if gradio.shared.show_label && gradio.props.buttons && gradio.props.buttons.length > 0}
				<IconButtonWrapper
					buttons={gradio.props.buttons}
					on_custom_button_click={(id) => {
						gradio.dispatch("custom_button_click", { id });
					}}
				/>
			{/if}
			<BlockLabel
				show_label={gradio.shared.show_label}
				Icon={File}
				label={gradio.shared.label || "3D Model"}
			/>

			<Empty unpadded_box={true} size="large"><File /></Empty>
		{/if}
	</Block>
{:else}
	<Block
		visible={gradio.shared.visible}
		variant={gradio.props.value === null ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
		height={gradio.props.height}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		<Model3DUpload
			bind:upload_promise
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			root={gradio.shared.root}
			display_mode={gradio.props.display_mode}
			clear_color={gradio.props.clear_color}
			value={gradio.props.value}
			camera_position={gradio.props.camera_position}
			zoom_speed={gradio.props.zoom_speed}
			bind:uploading
			on:change={({ detail }) => handle_change(detail)}
			on:drag={({ detail }) => handle_drag(detail)}
			on:clear={handle_clear}
			on:load={({ detail }) => handle_load(detail)}
			on:error={({ detail }) => handle_error(detail)}
			i18n={gradio.i18n}
			max_file_size={gradio.shared.max_file_size}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
		>
			<UploadText i18n={gradio.i18n} type="file" />
		</Model3DUpload>
	</Block>
{/if}
