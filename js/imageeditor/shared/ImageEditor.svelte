<script lang="ts" context="module">
	import type { Writable, Readable } from "svelte/store";
	import type { Spring } from "svelte/motion";
	// import { type PixiApp } from "./utils/pixi";
	// import { type CommandManager, type CommandNode } from "./utils/commands";
	import type { Tool, Subtool } from "./Toolbar.svelte";

	export const EDITOR_KEY = Symbol("editor");
	export type context_type = "bg" | "layers" | "crop" | "draw" | "erase";
</script>

<script lang="ts">
	import { onMount, setContext, createEventDispatcher, tick } from "svelte";
	import Toolbar, { type Tool as ToolbarTool } from "./Toolbar.svelte";
	import { CropTool } from "./crop/crop";
	import { ResizeTool } from "./resize/resize";
	import { Webcam } from "@gradio/image";
	import type { I18nFormatter } from "@gradio/utils";
	import type { Client, FileData } from "@gradio/client";
	import type { ColorInput } from "tinycolor2";
	import { ZoomTool } from "./zoom/zoom";
	import { type CommandManager, type CommandNode } from "./utils/commands";
	import { ImageEditor } from "./core/editor";
	import { type Brush, type Eraser } from "./brush/types";
	import { BrushTool } from "./brush/brush";
	import { create_drag } from "@gradio/upload";
	import Layers from "./Layers.svelte";
	import { Check } from "@gradio/icons";
	import type { LayerOptions, Source, Transform } from "./types";
	const { drag, open_file_upload } = create_drag();

	interface WeirdTypeData {
		url: string;
		meta: {
			_type: string;
		};
	}

	// import { type LayerScene } from "./layers/utils";
	import { type ImageBlobs } from "./types";
	import Controls from "./Controls.svelte";
	import IconButton from "./IconButton.svelte";
	export const antialias = true;
	// export let crop_size: [number, number] | undefined; no use any more
	export let changeable = false;
	// export const history = false; // Uncomment if needed
	export let sources: Source[] = ["upload", "webcam", "clipboard"];
	export let transforms: Transform[] = ["crop", "resize"];

	const dispatch = createEventDispatcher<{
		clear?: never;
		save: void;
		change: void;
		history: CommandManager["current_history"];
		upload: void;
		input: void;
	}>();

	export let canvas_size: [number, number];
	export const full_history: CommandNode | null = null;
	export let is_dragging = false;
	let pixi_target: HTMLDivElement;
	let pixi_target_crop: HTMLDivElement;
	export let background_image = false;
	export let brush_options: Brush;
	export let eraser_options: Eraser;
	export let fixed_canvas = false;
	export let root: string;
	export let mirror_webcam = true;
	export let i18n: I18nFormatter;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let composite: WeirdTypeData[];
	export let layers: WeirdTypeData[];
	export let background: WeirdTypeData;
	export let border_region: number;
	export let layer_options: LayerOptions;
	/**
	 * Gets the image blobs from the editor
	 * @returns {Promise<ImageBlobs>} Object containing background, layers, and composite image blobs
	 */
	export async function get_blobs(): Promise<ImageBlobs> {
		// Implement function logic or adjust return type

		const blobs = await editor.get_blobs();
		return blobs;
	}

	let editor: ImageEditor;

	/**
	 * Adds an image to the editor
	 * @param {Blob | File} image - The image to add
	 */
	export function add_image(image: Blob | File): void {
		editor.add_image({ image });
	}

	let pending_bg: Promise<void>;
	/**
	 * Adds an image to the editor from a URL
	 * @param {string | FileData} source - The URL of the image or a FileData object
	 * @returns {Promise<void>}
	 */
	export async function add_image_from_url(
		source:
			| string
			| {
					url: string;
					meta: {
						_type: string;
					};
			  }
			| any,
	): Promise<void> {
		if (!editor) return;

		let url: string;

		// Handle different source types
		if (typeof source === "string") {
			url = source;
		} else if (source?.meta?._type === "gradio.FileData" && source?.url) {
			url = source.url;
		} else {
			console.warn("Invalid source provided to add_image_from_url:", source);
			return;
		}

		try {
			pending_bg = editor.add_image_from_url(url);
			await pending_bg;
			background_image = true;
			dispatch("upload");
			dispatch("input");
		} catch (error) {
			console.error("Error adding image from URL:", error);
		}
	}

	/**
	 * Adds a new layer with an image loaded from a URL
	 * @param {string | FileData} source - The URL of the image or a FileData object
	 * @returns {Promise<string | null>} - The ID of the created layer, or null if failed
	 */
	export async function add_layers_from_url(
		source: WeirdTypeData[] | any,
	): Promise<void> {
		if (!editor) return;

		let url: string;

		// Handle different source types
		if (
			Array.isArray(source) &&
			source.every((item) => item?.meta?._type === "gradio.FileData")
		) {
			try {
				await pending_bg;

				await editor.add_layers_from_url(source.map((item) => item.url));
				dispatch("change");
				dispatch("input");
			} catch (error) {
				console.error("Error adding layer from URL:", error);
			}
		}
	}

	export let current_tool: ToolbarTool;

	let brush: BrushTool;
	let zoom: ZoomTool;
	let zoom_level = 1;
	let ready = false;
	let mounted = false;
	let min_zoom = true;

	onMount(() => {
		mounted = true;
		init_image_editor();

		return () => {
			if (editor) {
				editor.destroy();
			}
		};
	});

	let crop: ImageEditor;
	let crop_zoom: ZoomTool;
	async function init_image_editor(): Promise<void> {
		brush = new BrushTool();
		zoom = new ZoomTool();
		editor = new ImageEditor({
			target_element: pixi_target,
			width: canvas_size[0],
			height: canvas_size[1],
			tools: ["image", zoom, new ResizeTool(), brush],
			fixed_canvas,
			border_region,
			layer_options,
		});

		crop_zoom = new ZoomTool();

		crop = new ImageEditor({
			target_element: pixi_target_crop,
			width: canvas_size[0],
			height: canvas_size[1],
			tools: ["image", crop_zoom, new CropTool()],
			dark: true,
			border_region,
		});

		editor.scale.subscribe((_scale) => {
			zoom_level = _scale;
		});

		editor.min_zoom.subscribe((is_min_zoom) => {
			min_zoom = is_min_zoom;
		});

		Promise.all([editor.ready, crop.ready]).then(() => {
			handle_tool_change({ tool: "image" });
			ready = true;
			crop.set_tool("image");
			crop.set_subtool("crop");
		});

		editor.on("change", () => {
			dispatch("change");
		});
	}

	function resize_canvas(width: number, height: number): void {
		if (!editor) return;
		if (mounted && ready) {
			editor.resize(width, height);
		}
	}

	/**
	 * Handles file uploads
	 * @param {File[]} files - The uploaded files
	 */
	async function handle_files(
		files: File[] | Blob[] | File | Blob | null,
	): Promise<void> {
		if (files == null) return;
		if (!sources.includes("upload")) return;
		const _file = Array.isArray(files) ? files[0] : files;
		await editor.add_image({ image: _file });
		await crop.add_image({ image: _file });
		crop.reset();
		background_image = true;

		dispatch("upload");
		dispatch("input");
	}

	/**
	 * Handles tool change events
	 * @param {{ tool: ToolbarTool }} param0 - Object containing the selected tool
	 */
	function handle_tool_change({ tool }: { tool: ToolbarTool }): void {
		editor.set_tool(tool);
		current_tool = tool;
	}

	/**
	 * Handles subtool change events
	 * @param {{ tool: ToolbarTool, subtool: Subtool }} param0 - Object containing the selected tool and subtool
	 */
	function handle_subtool_change({
		tool,
		subtool,
	}: {
		tool: ToolbarTool;
		subtool: Subtool | null;
	}): void {
		editor.set_subtool(subtool);
		current_subtool = subtool;

		if (subtool === null) {
			return;
		}

		if (tool === "draw") {
			if (subtool === "size") {
				brush_size_visible = true;
			} else if (subtool === "color") {
				brush_color_visible = true;
			}
		}

		if (tool === "erase" && subtool === "size") {
			eraser_size_visible = true;
		}

		if (tool === "image" && subtool === "paste") {
			process_clipboard();
		}

		if (tool === "image" && subtool === "upload") {
			tick().then(() => {
				disable_click = false;
				open_file_upload();
			});
		}
	}

	let eraser_size_visible = false;
	let selected_color: ColorInput | string;
	let selected_size: number;
	let selected_opacity = 1;
	let selected_eraser_size: number;

	$: {
		if (brush_options) {
			update_brush_options();
		}

		if (eraser_options) {
			update_eraser_options();
		}
	}

	function update_brush_options(): void {
		selected_color =
			brush_options.default_color === "auto"
				? brush_options.colors[0]
				: brush_options.default_color;
		selected_size =
			typeof brush_options.default_size === "number"
				? brush_options.default_size
				: 25;
		selected_opacity = 1;
	}

	function update_eraser_options(): void {
		selected_eraser_size =
			eraser_options.default_size === "auto" ? 25 : eraser_options.default_size;
	}

	let brush_size_visible = false;

	let brush_color_visible = false;

	$: brush?.set_brush_color(
		selected_color === "auto"
			? brush_options.colors.find(
					(color) => color === brush_options.default_color,
				) || brush_options.colors[0]
			: selected_color,
	);

	// Type-safe brush size handling
	$: brush?.set_brush_size(
		typeof selected_size === "number" ? selected_size : 25,
	);

	$: brush?.set_eraser_size(
		typeof selected_eraser_size === "number" ? selected_eraser_size : 25,
	);

	$: disable_click =
		current_tool !== "image" ||
		(current_tool === "image" && background_image) ||
		(current_tool === "image" && current_subtool === "webcam") ||
		!sources.includes("upload");

	let current_subtool: Subtool | null = null;
	let preview = false;
	$: brush?.preview_brush(preview);
	$: brush?.set_brush_opacity(selected_opacity);

	function handle_zoom_change(zoom_level: number | "fit"): void {
		zoom.set_zoom(zoom_level);
	}

	function zoom_in_out(direction: "in" | "out"): void {
		zoom.set_zoom(
			direction === "in"
				? zoom_level + (zoom_level < 1 ? 0.1 : zoom_level * 0.1)
				: zoom_level - (zoom_level < 1 ? 0.1 : zoom_level * 0.1),
		);
	}

	async function process_clipboard(): Promise<void> {
		const items = await navigator.clipboard.read();

		for (let i = 0; i < items.length; i++) {
			const type = items[i].types.find((t) => t.startsWith("image/"));
			if (type) {
				const blob = await items[i].getType(type);

				handle_files(blob);
			}
		}
	}

	function handle_capture(e: CustomEvent): void {
		if (e.detail !== null) {
			handle_files(e.detail as Blob);
		}
		handle_subtool_change({ tool: current_tool, subtool: null });
	}

	function handle_save(): void {
		dispatch("save");
	}

	$: add_image_from_url(composite || background);
	$: add_layers_from_url(layers);

	async function handle_crop_confirm(): Promise<void> {
		const { image, x, y, original_dimensions } = await crop.get_crop_bounds();
		if (!image) return;
		editor.add_image({
			image,
			resize: false,
			crop_offset: { x, y },
			original_dimensions,
			is_cropped: true,
		});
		handle_subtool_change({ tool: "image", subtool: null });
	}
</script>

<div
	data-testid="image"
	class="image-container"
	class:dark-bg={current_subtool === "crop"}
	use:drag={{
		on_drag_change: (dragging) => (is_dragging = dragging),
		on_files: handle_files,
		accepted_types: "image/*",
		disable_click: disable_click,
	}}
>
	{#if ready}
		{#if current_subtool !== "crop"}
			<Controls
				{changeable}
				on:set_zoom={(e) => handle_zoom_change(e.detail)}
				on:zoom_in={() => zoom_in_out("in")}
				on:zoom_out={() => zoom_in_out("out")}
				{min_zoom}
				current_zoom={zoom_level}
				on:remove_image={() => {
					editor.reset_canvas();
					background_image = false;
				}}
				tool={current_tool}
				dimensions={editor.dimensions}
				on:resize={(e) => {
					editor.modify_canvas_size(
						e.detail.width,
						e.detail.height,
						e.detail.anchor,
						e.detail.scale,
					);
				}}
				can_save={true}
				on:save={handle_save}
				on:pan={(e) => {
					handle_tool_change({ tool: "pan" });
				}}
			/>
		{/if}
		<!-- on:save={handle_save} -->
		<!-- can_save={saved_history !== $current_history} -->
		<!-- on:remove_image={handle_remove} -->
		<!-- 
    can_undo={$can_undo}
		can_redo={$can_redo}
		{changeable}
		on:undo={CommandManager.undo}
		on:redo={CommandManager.redo}
   -->
		{#if current_subtool !== "crop"}
			<Toolbar
				{sources}
				{transforms}
				background={background_image}
				on:tool_change={(e) => handle_tool_change(e.detail)}
				on:subtool_change={(e) => handle_subtool_change(e.detail)}
				show_brush_size={brush_size_visible}
				show_brush_color={brush_color_visible}
				show_eraser_size={eraser_size_visible}
				{brush_options}
				{eraser_options}
				bind:selected_color
				bind:selected_size
				bind:selected_eraser_size
				bind:selected_opacity
				bind:preview
				tool={current_tool}
				subtool={current_subtool}
			/>
		{/if}

		{#if current_tool === "image" && current_subtool === "webcam"}
			<div class="modal">
				<div class="modal-inner">
					<Webcam
						{upload}
						{root}
						on:capture={handle_capture}
						on:error
						on:drag
						{mirror_webcam}
						streaming={false}
						mode="image"
						include_audio={false}
						{i18n}
					/>
				</div>
			</div>
		{/if}

		{#if current_subtool !== "crop" && !layer_options.disabled}
			<Layers
				enable_additional_layers={layer_options.allow_additional_layers}
				layers={editor.layers}
				on:new_layer={() => {
					editor.add_layer();
				}}
				on:change_layer={(e) => {
					editor.set_layer(e.detail);
				}}
				on:move_layer={(e) => {
					editor.move_layer(e.detail.id, e.detail.direction);
				}}
				on:delete_layer={(e) => {
					editor.delete_layer(e.detail);
				}}
			/>
		{/if}
	{/if}
	<div
		class="pixi-target"
		class:visible={current_subtool !== "crop"}
		bind:this={pixi_target}
	></div>
	<div
		class="pixi-target-crop"
		class:visible={current_subtool === "crop"}
		bind:this={pixi_target_crop}
	></div>

	{#if current_subtool === "crop"}
		<div class="crop-confirm-button">
			<IconButton
				Icon={Check}
				label="Confirm crop"
				show_label={true}
				size="large"
				padded={true}
				color="white"
				background="var(--color-green-500)"
				label_position="right"
				on:click={handle_crop_confirm}
			/>
		</div>
	{/if}
	<slot></slot>
</div>

<style>
	.image-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-height: 100%;
		border-radius: var(--radius-sm);
	}

	.pixi-target {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		display: block;
		opacity: 0;
		pointer-events: none;
	}

	.pixi-target-crop {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
		display: block;
		opacity: 0;
		pointer-events: none;
	}

	.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.pixi-target {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
	}

	.modal {
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0;
		right: 0;
		margin: auto;
		z-index: var(--layer-top);
		display: flex;
		align-items: center;
	}

	.modal-inner {
		height: 100%;
		width: 100%;
		background: var(--block-background-fill);
	}

	.dark-bg {
		background: #333;
	}

	.crop-confirm-button {
		position: absolute;
		bottom: 8px;
		left: 0;
		right: 0;
		margin: auto;
		z-index: var(--layer-top);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
