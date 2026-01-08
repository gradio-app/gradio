<script context="module" lang="ts">
	export { default as BaseGallery } from "./shared/Gallery.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { tick } from "svelte";
	import type { FileData } from "@gradio/client";
	import { Block, UploadText } from "@gradio/atoms";
	import Gallery from "./shared/Gallery.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";
	import { BaseFileUpload } from "@gradio/file";
	import type { GalleryProps, GalleryEvents, GalleryData } from "./types";

	let upload_promise = $state<Promise<any>>();

	class GalleryGradio extends Gradio<GalleryEvents, GalleryProps> {
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
	const gradio = new GalleryGradio<GalleryEvents, GalleryProps>(props, {
		selected_index: null
	});

	let fullscreen = $state(false);

	let no_value = $derived(
		gradio.props.value === null ? true : gradio.props.value.length === 0
	);

	function handle_delete(
		event: CustomEvent<{ file: FileData; index: number }>
	): void {
		if (!gradio.props.value) return;
		const { index } = event.detail;
		gradio.dispatch("delete", event.detail);
		gradio.props.value = gradio.props.value.filter((_, i) => i !== index);
		gradio.dispatch("change", gradio.props.value);
	}

	async function process_upload_files(
		files: FileData[]
	): Promise<GalleryData[]> {
		const processed_files = await Promise.all(
			files.map(async (x) => {
				if (x.path?.toLowerCase().endsWith(".svg") && x.url) {
					const response = await fetch(x.url);
					const svgContent = await response.text();
					return {
						...x,
						url: `data:image/svg+xml,${encodeURIComponent(svgContent)}`
					};
				}
				return x;
			})
		);

		return processed_files.map((x) =>
			x.mime_type?.includes("video")
				? { video: x, caption: null }
				: { image: x, caption: null }
		);
	}
</script>

<Block
	visible={gradio.shared.visible}
	variant="solid"
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	height={typeof gradio.props.height === "number"
		? gradio.props.height
		: undefined}
	bind:fullscreen
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	{#if gradio.shared.interactive && no_value}
		<BaseFileUpload
			bind:upload_promise
			value={null}
			root={gradio.shared.root}
			label={gradio.shared.label}
			max_file_size={gradio.shared.max_file_size}
			file_count={"multiple"}
			file_types={gradio.props.file_types}
			i18n={gradio.i18n}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
			on:upload={async (e) => {
				const files = Array.isArray(e.detail) ? e.detail : [e.detail];
				gradio.props.value = await process_upload_files(files);
				gradio.dispatch("upload", gradio.props.value);
				gradio.dispatch("change", gradio.props.value);
			}}
			on:error={({ detail }) => {
				gradio.shared.loading_status = gradio.shared.loading_status || {};
				gradio.shared.loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
		>
			<UploadText i18n={gradio.i18n} type="gallery" />
		</BaseFileUpload>
	{:else}
		<Gallery
			on_change={() => gradio.dispatch("change")}
			on_clear={() => gradio.dispatch("change")}
			on_select={(e) => gradio.dispatch("select", e)}
			on_share={(e) => gradio.dispatch("share", e.detail)}
			on_error={(e) => gradio.dispatch("error", e.detail)}
			on_preview_open={() => {
				gradio.dispatch("preview_open");
			}}
			on_preview_close={() => gradio.dispatch("preview_close")}
			on_fullscreen={({ detail }) => {
				fullscreen = detail;
			}}
			on_delete={handle_delete}
			on_upload={async (e) => {
				const files = Array.isArray(e.detail) ? e.detail : [e.detail];
				const new_value = await process_upload_files(files);
				gradio.props.value = gradio.props.value
					? [...gradio.props.value, ...new_value]
					: new_value;
				gradio.dispatch("upload", new_value);
				gradio.dispatch("change", gradio.props.value);
			}}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			columns={gradio.props.columns}
			rows={gradio.props.rows}
			height={gradio.props.height}
			preview={gradio.props.preview}
			object_fit={gradio.props.object_fit}
			interactive={gradio.shared.interactive}
			allow_preview={gradio.props.allow_preview}
			bind:selected_index={gradio.props.selected_index}
			bind:value={gradio.props.value}
			show_share_button={gradio.props.buttons.some(
				(btn) => typeof btn === "string" && btn === "share"
			)}
			show_download_button={gradio.props.buttons.some(
				(btn) => typeof btn === "string" && btn === "download"
			)}
			fit_columns={gradio.props.fit_columns}
			i18n={gradio.i18n}
			_fetch={(...args) => gradio.shared.client.fetch(...args)}
			show_fullscreen_button={gradio.props.buttons.some(
				(btn) => typeof btn === "string" && btn === "fullscreen"
			)}
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
			{fullscreen}
			root={gradio.shared.root}
			file_types={gradio.props.file_types}
			max_file_size={gradio.shared.max_file_size}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
		/>
	{/if}
</Block>
