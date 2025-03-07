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
	import { writable } from "svelte/store";
	import { spring } from "svelte/motion";
	import { Rectangle } from "pixi.js";
	import { ZoomTool } from "./zoom/zoom";
	import {
		command_manager,
		type CommandManager,
		type CommandNode,
	} from "./utils/commands";
	import { ImageEditor } from "./core/editor";
	import { type Brush, type Eraser } from "./brush/types";
	import { BrushTool } from "./brush/brush";
	import { drag } from "@gradio/upload";
	import Layers from "./Layers.svelte";

	// import { type LayerScene } from "./layers/utils";
	import { type ImageBlobs } from "./types";
	import Controls from "./Controls.svelte";
	export const antialias = true;
	// export let crop_size: [number, number] | undefined; no use any more
	export let changeable = false;
	// export const history = false; // Uncomment if needed
	// export const sources = [];
	// export const full_history = null;
	const dispatch = createEventDispatcher<{
		clear?: never;
		save: void;
		change: void;
		history: CommandManager["current_history"];
	}>();
	export let canvas_size: [number, number];
	export const full_history: CommandNode | null = null;
	export let is_dragging = false;
	let pixi_target: HTMLDivElement;
	export let background_image = false;
	export let brush_options: Brush;
	export let eraser_options: Eraser;

	/**
	 * Gets the full editing history of the image editor
	 * @returns {Promise<CommandNode>} The command history node
	 */
	export async function get_full_history(): Promise<CommandNode | null> {
		// Implement function logic or adjust return type
		return null; // Placeholder
	}

	/**
	 * Gets the image blobs from the editor
	 * @returns {Promise<ImageBlobs>} Object containing background, layers, and composite image blobs
	 */
	export async function get_blobs(): Promise<ImageBlobs> {
		// Implement function logic or adjust return type
		return { background: null, layers: [], composite: null }; // Placeholder
	}

	let editor: ImageEditor;

	// $: console.log(canvas_size);

	/**
	 * Adds an image to the editor
	 * @param {Blob | File} image - The image to add
	 */
	export function add_image(image: Blob | File): void {
		editor.add_image(image);
	}
	// $: console.log({ current_tool });
	export let current_tool: ToolbarTool;

	let brush: BrushTool;
	let zoom: ZoomTool;
	let zoom_level = 1;
	let ready = false;
	onMount(() => {
		brush = new BrushTool();
		zoom = new ZoomTool();
		editor = new ImageEditor({
			target_element: pixi_target,
			width: canvas_size[0],
			height: canvas_size[1],
			tools: ["image", zoom, new CropTool(), new ResizeTool(), brush],
		});

		editor.scale.subscribe((_scale) => {
			zoom_level = _scale;
		});

		editor.ready.then(() => {
			handle_tool_change({ tool: "image" });
			ready = true;
		});

		console.log("editor", editor);
	});

	/**
	 * Handles file uploads
	 * @param {File[]} files - The uploaded files
	 */
	function handle_files(files: File[]): void {
		editor.add_image(files[0]);
		background_image = true;

		dispatch("change");
	}

	// $: console.log(editor.current_history);

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
		subtool: Subtool;
	}): void {
		editor.set_subtool(subtool);

		// When subtool is null, we're just closing the options panel
		// but we want to keep the tool active
		if (subtool === null) {
			// Don't reset any visibility flags here
			// Just pass the null subtool to the editor
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
	}

	let brush_size_visible = false;

	let brush_color_visible = false;

	let eraser_size_visible = false;
	let selected_color = brush_options.default_color;
	let selected_size =
		typeof brush_options.default_size === "number"
			? brush_options.default_size
			: 25;
	let selected_opacity = 1;
	let selected_eraser_size =
		typeof eraser_options.default_size === "number"
			? eraser_options.default_size
			: 25;
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
		current_tool !== "image" || (current_tool === "image" && background_image);
	let preview = false;
	$: brush?.preview_brush(preview);
	$: brush?.set_brush_opacity(selected_opacity);

	function handle_zoom_change(zoom_level: number | "fit"): void {
		console.log("Zoom level:", zoom_level);
		zoom.set_zoom(zoom_level);
	}

	function zoom_in_out(direction: "in" | "out"): void {
		zoom.set_zoom(
			direction === "in"
				? zoom_level + (zoom_level < 1 ? 0.1 : zoom_level * 0.1)
				: zoom_level - (zoom_level < 1 ? 0.1 : zoom_level * 0.1),
		);
	}
</script>

<div
	data-testid="image"
	class="image-container"
	use:drag={{
		on_drag_change: (dragging) => (is_dragging = dragging),
		on_files: handle_files,
		accepted_types: "image/*",
		disable_click: disable_click,
	}}
>
	{#if ready}
		<Controls
			{changeable}
			on:set_zoom={(e) => handle_zoom_change(e.detail)}
			on:zoom_in={() => zoom_in_out("in")}
			on:zoom_out={() => zoom_in_out("out")}
			current_zoom={zoom_level}
			on:remove_image={() => {
				editor.reset_canvas();
				background_image = false;
			}}
			dimensions={editor.dimensions}
			on:resize={(e) => {
				console.log("resize", e.detail);

				editor.modify_canvas_size(
					e.detail.width,
					e.detail.height,
					e.detail.anchor,
					e.detail.scale,
				);
			}}
		/>
		<!-- on:save={handle_save} -->
		<!-- can_save={saved_history !== $current_history} -->
		<!-- on:remove_image={handle_remove} -->
		<!-- 
    can_undo={$can_undo}
		can_redo={$can_redo}
		{changeable}
		on:undo={CommandManager.undo}
		on:redo={CommandManager.redo}
   --><Toolbar
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
		/>
		<Layers
			layers={editor.layers}
			on:new_layer={() => {
				console.log("new layer");
				editor.add_layer();
			}}
			on:change_layer={(e) => {
				console.log("change layer -- parent", e.detail);
				editor.set_layer(e.detail);
			}}
			on:move_layer={(e) => {
				console.log("move layer -- parent	", e.detail);
				editor.move_layer(e.detail.id, e.detail.direction);
			}}
			on:delete_layer={(e) => {
				console.log("delete layer -- parent", e.detail);
				editor.delete_layer(e.detail);
			}}
		/>
	{/if}
	<div class="pixi-target" bind:this={pixi_target}></div>
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
</style>
