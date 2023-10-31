<script lang="ts">
	import type { Brush, EditorData, PathData } from "./types";
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Brush as Paint, Chat as Crop } from "@gradio/icons";
	import type { SelectData, I18nFormatter } from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";

	import { Webcam } from "@gradio/image";

	import { Upload } from "@gradio/upload";
	import { type FileData, normalise_file } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";
	import Pixi from "./Pixi.svelte";
	import EditorTools from "./EditorTools.svelte";
	import { _ } from "svelte-i18n";

	export let value: EditorData = {
		background: null,
		layers: [],
		composite: null
	};
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let streaming = false;
	export let pending = false;
	export let mirror_webcam: boolean;
	export let root: string;
	export let i18n: I18nFormatter;
	export let transforms: ("crop" | "rotate")[];
	export let brush: Brush;
	let upload: Upload;
	export let active_tool: "webcam" | null = null;

	function handle_upload({ detail }: CustomEvent<FileData>): void {
		value.background = normalise_file(detail, root, null);
	}

	async function handle_save(img_blob: Blob | any): Promise<void> {
		pending = true;
		const f = await upload.load_files([new File([img_blob], `webcam.png`)]);

		value.background = f?.[0] || null;
		if (!streaming) active_tool = null;

		await tick();

		dispatch(streaming ? "stream" : "change");
		pending = false;
	}

	// $: value && !value.url && (value = normalise_file(value, root, null));

	const dispatch = createEventDispatcher<{
		change?: EditorData;
		stream?: never;
		clear?: never;
		drag: boolean;
		upload?: never;
		select: SelectData;
	}>();

	let dragging = false;

	$: dispatch("drag", dragging);

	function handle_click(evt: MouseEvent): void {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	}

	let _layers: PathData[][] = [[]];
	let current_layer = 0;
	function add_layer(): void {
		_layers = [..._layers, []];
		current_layer = _layers.length - 1;
		selected_color = Math.floor(Math.random() * brush.colors.length);
	}

	async function handle_source(
		source: (typeof sources)[number]
	): Promise<void> {
		switch (source) {
			case "clipboard":
				navigator.clipboard.read().then(async (items) => {
					for (let i = 0; i < items.length; i++) {
						const type = items[i].types.find((t) => t.startsWith("image/"));
						if (type) {
							items[i].getType(type).then(async (blob) => {
								const f = await upload.load_files([
									new File([blob], `clipboard.${type.replace("image/", "")}`)
								]);
								f;
								value.background = f?.[0] || null;
							});
							break;
						}
					}
				});
				break;
			case "webcam":
				active_tool = "webcam";
				break;
			case "upload":
				upload.open_file_upload();
				break;
			default:
				break;
		}
	}

	let selected_size = brush.sizes.findIndex(
		(v) => JSON.stringify(v) == JSON.stringify(brush.default_size)
	);
	let selected_color = brush.colors.findIndex(
		(v) => JSON.stringify(v) == JSON.stringify(brush.default_color)
	);

	let pixi: Pixi;

	function handle_remove(): void {
		value = { background: null, layers: [], composite: null };
		_layers = [[]];
		pixi.clear();
	}
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />

<div data-testid="image" class="image-container">
	<ClearImage on:remove_image={handle_remove} />

	<Pixi
		bind:this={pixi}
		bg={value?.background?.url}
		layers={_layers}
		brush_size={brush.sizes[selected_size]}
		brush_color={brush.colors[selected_color]}
		antialias={brush?.antialias}
		{current_layer}
		{root}
		on:change={(e) => dispatch("change", e.detail)}
	/>
	<div class="upload-container">
		<Upload
			hidden={true}
			bind:this={upload}
			bind:dragging
			filetype="image/*"
			on:load={handle_upload}
			on:error
			{root}
			disable_click={!sources.includes("upload")}
		></Upload>
		{#if active_tool === "webcam"}
			<Webcam
				on:capture={(e) => handle_save(e.detail)}
				on:stream={(e) => handle_save(e.detail)}
				on:error
				on:drag
				on:upload={(e) => handle_save(e.detail)}
				{mirror_webcam}
				{streaming}
				mode="image"
				include_audio={false}
				{i18n}
			/>
		{/if}
	</div>
	<EditorTools
		{sources}
		{brush}
		{transforms}
		{i18n}
		on:set_source={(e) => handle_source(e.detail)}
		on:new_layer={add_layer}
		bind:current_layer
		layers={_layers}
		bind:selected_color
		colors={brush.colors}
		bind:selected_size
		sizes={brush.sizes}
	/>
</div>

<style>
	.upload-container {
		height: 100%;
		flex-shrink: 1;
		max-height: 100%;
	}

	.image-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-height: 100%;
	}
</style>
