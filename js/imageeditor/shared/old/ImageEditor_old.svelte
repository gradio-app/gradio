<script lang="ts">
	import type { Eraser, Brush, EditorData, PathData } from "./types";
	import { createEventDispatcher, onMount, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Brush as Paint, Chat as Crop } from "@gradio/icons";
	import type { SelectData, I18nFormatter } from "@gradio/utils";

	import { Webcam } from "@gradio/image";

	import { Upload } from "@gradio/upload";
	import { type FileData, normalise_file } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";
	import Pixi, { type coords } from "./Pixi.svelte";
	import EditorTools from "./EditorTools.svelte";
	import { _ } from "svelte-i18n";
	import {
		command_manager,
		layer_manager,
		type LayerScene
	} from "./scene_manager";
	import * as PIXI_Lib from "pixi.js";
	import { draw_path, type Command, type DrawCommand } from "./commands";

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
	export let eraser: Eraser;
	let upload: Upload;
	export let active_tool: "webcam" | null = null;

	function handle_upload({ detail }: CustomEvent<FileData>): void {
		value.background = normalise_file(detail, root, null);
	}

	async function handle_capture(img_blob: Blob | any): Promise<void> {
		pending = true;
		const f = await upload.load_files([new File([img_blob], `webcam.png`)]);

		value.background = f?.[0] || null;
		if (!streaming) active_tool = null;

		await tick();

		dispatch("change");
		pending = false;
	}

	// $: value && !value.url && (value = normalise_file(value, root, null));

	const dispatch = createEventDispatcher<{
		change?: EditorData;
		clear?: never;
		drag: boolean;
		upload?: never;
		select: SelectData;
	}>();

	let dragging = false;

	$: dispatch("drag", dragging);

	let _layers: PathData[][] = [[]];
	let current_layer: LayerScene;
	function add_layer(): void {
		// _layers = [..._layers, []];
		// current_layer = _layers.length - 1;
		// selected_color = Math.floor(Math.random() * brush.colors.length);
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

	let CommandManager: ReturnType<typeof command_manager>;
	let LayerManager: ReturnType<typeof layer_manager>;

	let pixi_container: PIXI_Lib.Container;

	let draw_command: DrawCommand;

	function handle_draw_start(e: CustomEvent<coords>): void {
		if (category === "brush") {
			draw_command = draw_path(
				pixi.get_renderer(),
				pixi.get_stage(),
				current_layer,
				"draw"
			);
			draw_command.start({
				x: e.detail.x,
				y: e.detail.y,
				color: brush.colors[selected_color] as PIXI_Lib.Color,
				size: brush.sizes[selected_size],
				opacity: 1
				// layer: current_layer
			});
		} else if (category === "eraser") {
			draw_command = draw_path(
				pixi.get_renderer(),
				pixi.get_container(),
				current_layer,
				"erase"
			);
			draw_command.start({
				x: e.detail.x,
				y: e.detail.y,
				size: eraser.sizes[selected_size],
				opacity: 1
				// layer: current_layer
			});
		}
	}

	function handle_draw_continue({
		detail: { x, y }
	}: CustomEvent<coords>): void {
		// console.log(category, draw_command.drawing);
		if (draw_command.drawing)
			draw_command.continue({
				x,
				y
			});
	}
	onMount(() => {
		pixi_container = pixi.get_container();

		// console.log(pixi_container);
		CommandManager = command_manager();
		LayerManager = layer_manager();
	});

	// $: console.log(category);

	let category: "bg" | "transform" | "brush" | "eraser" = "bg";
	let pixi_height = 0;
	let pixi_width = 0;

	function handle_add_image(): void {
		current_layer = LayerManager.add_layer(
			1,
			pixi.get_container(),

			pixi.get_renderer(),
			pixi_width,
			pixi_height
		);
	}
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />

<div data-testid="image" class="image-container">
	<ClearImage on:remove_image={handle_remove} />

	<Pixi
		bind:this={pixi}
		bg={value?.background?.url}
		antialias={brush?.antialias}
		{root}
		on:change={(e) => dispatch("change", e.detail)}
		on:draw_start={handle_draw_start}
		on:draw_continue={handle_draw_continue}
		on:draw_end={(e) => draw_command.stop()}
		on:add_image={handle_add_image}
		bind:pixi_height
		bind:pixi_width
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
			mode="blob"
		></Upload>
		{#if active_tool === "webcam"}
			<Webcam
				on:capture={(e) => handle_capture(e.detail)}
				on:error
				on:drag
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
		{eraser}
		{transforms}
		{i18n}
		on:set_source={(e) => handle_source(e.detail)}
		on:new_layer={add_layer}
		layers={_layers}
		bind:selected_color
		colors={brush.colors}
		bind:selected_size
		bind:category
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
