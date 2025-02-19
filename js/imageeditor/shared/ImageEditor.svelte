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

	import { command_manager } from "./utils/commands";
	import { ImageEditor } from "./core/editor";
	import { BrushTool } from "./brush/brush";
	import { drag } from "@gradio/upload";

	// import { type LayerScene } from "./layers/utils";
	import { type ImageBlobs } from "./types";
	import Controls from "./Controls.svelte";
	export let antialias = true;
	// export let crop_size: [number, number] | undefined; no use any more
	export let changeable = false;
	export let history: boolean;
	export let sources: ("clipboard" | "webcam" | "upload")[];
	const dispatch = createEventDispatcher<{
		clear?: never;
		save: void;
		change: void;
		history: CommandManager["current_history"];
	}>();
	export let canvas_size: [number, number];
	export let full_history: CommandNode | null = null;
	export let is_dragging = false;
	let disable_click = false;
	let pixi_target: HTMLDivElement;
	export let background_image = false;

	export async function get_full_history(): Promise<CommandNode> {}

	export async function get_blobs(): Promise<ImageBlobs> {}

	let editor: ImageEditor;

	$: console.log(canvas_size);

	export function add_image(image: Blob | File): void {
		editor.add_image(image);
	}
	$: console.log({ current_tool });
	export let current_tool: ToolbarTool;

	onMount(() => {
		editor = new ImageEditor({
			target_element: pixi_target,
			width: canvas_size[0],
			height: canvas_size[1],
			tools: [
				"image",
				"zoom",
				new CropTool(),
				new ResizeTool(),
				new BrushTool(),
			],
		});

		editor.ready.then(() => {
			handle_tool_change({ tool: "image" });
		});
	});

	function handle_files(files: File[]): void {
		editor.add_image(files[0]);
		disable_click = true;
		background_image = true;

		dispatch("change");
	}

	// $: console.log(editor.current_history);

	function handle_tool_change({ tool }: { tool: ToolbarTool }): void {
		editor.set_tool(tool);
		console.log("TOOL CHANGE", tool);
		current_tool = tool;

		disable_click = tool !== "image";
	}

	function handle_subtool_change({
		tool,
		subtool,
	}: {
		tool: ToolbarTool;
		subtool: Subtool;
	}): void {
		console.log(tool, subtool);
		editor.set_subtool(subtool);
	}
</script>

<!-- <svelte:window on:scroll={() => get_dimensions(canvas_wrap, pixi_target)} /> -->

<div
	data-testid="image"
	class="image-container"
	use:drag={{
		on_drag_change: (dragging) => (is_dragging = dragging),
		on_files: handle_files,
		accepted_types: "image/*",
		disable_click: disable_click || background_image,
	}}
>
	<Controls {changeable} />
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
	<div class="pixi-target" bind:this={pixi_target}></div>
	<slot></slot>
	<!-- <Sources /> -->
	<Toolbar
		background={background_image}
		on:tool_change={(e) => handle_tool_change(e.detail)}
		on:subtool_change={(e) => handle_subtool_change(e.detail)}
	/>
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
