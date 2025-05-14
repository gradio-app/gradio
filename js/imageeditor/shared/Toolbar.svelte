<script lang="ts" context="module">
	export type Tool = "image" | "draw" | "erase" | "pan";
	export type Subtool =
		| "upload"
		| "paste"
		| "webcam"
		| "color"
		| "size"
		| "crop"
		| "remove_background"
		| null;
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import IconButton from "./IconButton.svelte";
	import {
		Image,
		Brush,
		Erase,
		Crop,
		Upload,
		ImagePaste,
		Webcam,
		Circle,
		Resize,
		ColorPickerSolid
	} from "@gradio/icons";
	import BrushOptions from "./brush/BrushOptions.svelte";
	import type { Source, Transform } from "./types";
	import {
		type Brush as BrushType,
		type Eraser as EraserType
	} from "./brush/types";
	import tinycolor from "tinycolor2";

	export let tool: Tool = "image";
	export let subtool: Subtool = null;

	export let background = false;
	export let brush_options: BrushType | false;
	export let selected_size =
		brush_options && typeof brush_options.default_size === "number"
			? brush_options.default_size
			: 25;
	export let eraser_options: EraserType;
	export let selected_eraser_size =
		eraser_options && typeof eraser_options.default_size === "number"
			? eraser_options.default_size
			: 25;

	// Handle default_color including potential color-opacity tuple
	export let selected_color =
		brush_options &&
		(() => {
			const default_color = brush_options.default_color;
			if (Array.isArray(default_color)) {
				return default_color[0];
			}
			return default_color;
		})();

	// Set default opacity based on default_color if it's a tuple
	export let selected_opacity =
		brush_options &&
		(() => {
			const default_color = brush_options.default_color;
			if (Array.isArray(default_color)) {
				return default_color[1];
			}
			// Check if color string has opacity
			const color = tinycolor(default_color);
			if (color.getAlpha() < 1) {
				return color.getAlpha();
			}
			return 1;
		})();

	export let preview = false;
	export let show_brush_color = false;
	export let show_brush_size = false;
	export let show_eraser_size = false;
	export let sources: Source[];
	export let transforms: Transform[];
	let recent_colors: string[] = [];

	let enable_layers = true;
	const dispatch = createEventDispatcher<{
		tool_change: { tool: Tool };
		subtool_change: {
			tool: Tool;
			subtool: Subtool;
		};
	}>();

	/**
	 * Handles tool click events
	 * @param {Tool} _tool - The selected tool
	 */
	function handle_tool_click(e: Event, _tool: Tool): void {
		e.stopPropagation();
		dispatch("tool_change", { tool: _tool });
	}

	/**
	 * Handles subtool click events
	 * @param {Event} e - The click event
	 * @param {Subtool} _subtool - The selected subtool
	 */
	function handle_subtool_click(e: Event, _subtool: typeof subtool): void {
		e.stopPropagation();

		dispatch("subtool_change", { tool, subtool: _subtool });
	}

	$: show_brush_size = tool === "draw" && subtool === "size";
	$: show_brush_color = tool === "draw" && subtool === "color";
	$: show_eraser_size = tool === "erase" && subtool === "size";

	$: can_crop = transforms.includes("crop");
	$: can_resize = transforms.includes("resize");
	$: can_upload = sources.includes("upload");
	$: can_webcam = sources.includes("webcam");
	$: can_paste = sources.includes("clipboard");
</script>

<div class="toolbar-wrap">
	<div class="half-container">
		{#if sources.length > 0}
			<IconButton
				Icon={Image}
				label="Image"
				highlight={tool === "image"}
				on:click={(e) => handle_tool_click(e, "image")}
				size="medium"
				padded={false}
				transparent={true}
			/>
		{/if}
		{#if brush_options}
			<IconButton
				Icon={Brush}
				label="Brush"
				on:click={(e) => handle_tool_click(e, "draw")}
				highlight={tool === "draw"}
				size="medium"
				padded={false}
				transparent={true}
			/>
		{/if}
		{#if eraser_options}
			<IconButton
				Icon={Erase}
				label="Erase"
				on:click={(e) => handle_tool_click(e, "erase")}
				highlight={tool === "erase"}
				size="medium"
				padded={false}
				transparent={true}
			/>
		{/if}
	</div>
	<div
		class="half-container right"
		class:hide={tool === "pan" ||
			(tool === "image" && !background && sources.length === 0) ||
			(tool === "image" && background && transforms.length === 0)}
	>
		{#if tool === "image"}
			{#if background}
				{#if can_crop}
					<IconButton
						Icon={Crop}
						label="Crop"
						on:click={(e) => handle_subtool_click(e, "crop")}
						highlight={subtool === "crop"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{/if}
				{#if can_resize}
					<IconButton
						Icon={Resize}
						label="Resize"
						on:click={(e) => handle_subtool_click(e, "size")}
						highlight={subtool === "size"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{/if}
			{:else}
				{#if can_upload}
					<IconButton
						Icon={Upload}
						label="Upload"
						on:click={(e) => handle_subtool_click(e, "upload")}
						highlight={subtool === "upload"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{/if}
				{#if can_paste}
					<IconButton
						Icon={ImagePaste}
						label="Paste"
						on:click={(e) => handle_subtool_click(e, "paste")}
						highlight={subtool === "paste"}
						size="large"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{/if}
				{#if can_webcam}
					<IconButton
						Icon={Webcam}
						label="Webcam"
						on:click={(e) => handle_subtool_click(e, "webcam")}
						highlight={subtool === "webcam"}
						size="medium"
						padded={false}
						transparent={true}
						offset={0}
					/>
				{/if}
			{/if}
		{/if}

		{#if tool === "draw" && brush_options}
			<IconButton
				Icon={ColorPickerSolid}
				label="Color"
				color={selected_color}
				on:click={(e) => handle_subtool_click(e, "color")}
				size="medium"
				padded={false}
				transparent={true}
				offset={0}
			/>
			<IconButton
				Icon={Circle}
				label="Brush Size"
				on:click={(e) => handle_subtool_click(e, "size")}
				highlight={subtool === "size"}
				size="medium"
				padded={false}
				transparent={true}
				offset={0}
			/>

			{#if show_brush_color || show_brush_size}
				<BrushOptions
					colors={brush_options.colors}
					color_mode={brush_options.color_mode}
					{recent_colors}
					show_swatch={show_brush_color}
					show_size={show_brush_size}
					bind:selected_size
					bind:selected_color
					bind:selected_opacity
					bind:preview
					on:click_outside={(e) => {
						e.stopPropagation();
						preview = false;
						show_brush_color = false;
						show_brush_size = false;
						handle_subtool_click(e, null);
					}}
					mode="brush"
				/>
			{/if}
		{/if}

		{#if tool === "erase" && eraser_options}
			<IconButton
				Icon={Circle}
				label="Eraser Size"
				on:click={(e) => handle_subtool_click(e, "size")}
				highlight={subtool === "size"}
				size="medium"
				padded={false}
				transparent={true}
				offset={0}
			/>
		{/if}
		{#if show_eraser_size}
			<BrushOptions
				colors={[]}
				show_swatch={false}
				show_size={true}
				bind:selected_size={selected_eraser_size}
				bind:selected_color
				bind:selected_opacity
				bind:preview
				on:click_outside={(e) => {
					e.stopPropagation();
					preview = false;
					show_eraser_size = false;
					handle_subtool_click(e, null);
				}}
				mode="eraser"
			/>
		{/if}
	</div>
</div>

<style>
	.toolbar-wrap {
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: absolute;
		left: 15px;
		right: 0;
		top: 30%;
		/* transform: translateY(-50%); */
		width: 30px;
		border: 1px solid var(--block-border-color);
		border-radius: var(--radius-md);

		gap: var(--spacing-sm);
		z-index: 1000;
		background-color: var(--block-background-fill);
	}

	.half-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		position: relative;
	}

	.half-container {
		width: 100%;
		padding: var(--spacing-sm) 0;
	}

	.half-container:last-child {
		border-top: 1px solid var(--block-border-color);
	}

	.hide {
		display: none;
	}

	/* .toolbar-left,
	.toolbar-right {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--spacing-sm);
		display: flex;
		z-index: 1000;
		border-radius: var(--radius-sm);
		background-color: #fff;
		padding: var(--spacing-sm) 0.3rem;
		width: auto;
	}

	.toolbar-right {
		border-left: 0;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.toolbar-left {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.toolbar-layers {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	} */
</style>
