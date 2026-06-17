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

	let {
		tool = "image",
		subtool = null,
		background = false,
		brush_options,
		selected_size = $bindable(),
		eraser_options,
		selected_eraser_size = $bindable(),
		selected_color = $bindable(),
		selected_opacity = $bindable(),
		preview = $bindable(),
		show_brush_color = false,
		show_brush_size = false,
		show_eraser_size = false,
		sources,
		transforms,
		ontool_change,
		onsubtool_change
	}: {
		tool?: Tool;
		subtool?: Subtool;
		background?: boolean;
		brush_options: BrushType | false;
		selected_size?: number;
		eraser_options: EraserType | false;
		selected_eraser_size?: number;
		selected_color?: any;
		selected_opacity?: number;
		preview?: boolean;
		show_brush_color?: boolean;
		show_brush_size?: boolean;
		show_eraser_size?: boolean;
		sources: Source[];
		transforms: Transform[];
		ontool_change?: (value: { tool: Tool }) => void;
		onsubtool_change?: (value: { tool: Tool; subtool: Subtool }) => void;
	} = $props();

	let recent_colors = $state<string[]>([]);

	/**
	 * Handles tool click events
	 * @param {Tool} _tool - The selected tool
	 */
	function handle_tool_click(e: Event, _tool: Tool): void {
		e.stopPropagation();
		ontool_change?.({ tool: _tool });
	}

	/**
	 * Handles subtool click events
	 * @param {Event} e - The click event
	 * @param {Subtool} _subtool - The selected subtool
	 */
	function handle_subtool_click(e: Event, _subtool: typeof subtool): void {
		e.stopPropagation();

		onsubtool_change?.({ tool, subtool: _subtool });
	}

	$effect(() => {
		show_brush_size = tool === "draw" && subtool === "size";
		show_brush_color = tool === "draw" && subtool === "color";
		show_eraser_size = tool === "erase" && subtool === "size";
	});

	let can_crop = $derived(transforms.includes("crop"));
	let can_resize = $derived(transforms.includes("resize"));
	let can_upload = $derived(sources.includes("upload"));
	let can_webcam = $derived(sources.includes("webcam"));
	let can_paste = $derived(sources.includes("clipboard"));
</script>

<div class="toolbar-wrap">
	<div class="half-container">
		{#if sources.length > 0}
			<IconButton
				Icon={Image}
				label="Image"
				highlight={tool === "image"}
				onclick={(e) => handle_tool_click(e, "image")}
				size="medium"
				padded={false}
				transparent={true}
			/>
		{/if}
		{#if brush_options}
			<IconButton
				Icon={Brush}
				label="Brush"
				onclick={(e) => handle_tool_click(e, "draw")}
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
				onclick={(e) => handle_tool_click(e, "erase")}
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
						onclick={(e) => handle_subtool_click(e, "crop")}
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
						onclick={(e) => handle_subtool_click(e, "size")}
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
						onclick={(e) => handle_subtool_click(e, "upload")}
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
						onclick={(e) => handle_subtool_click(e, "paste")}
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
						onclick={(e) => handle_subtool_click(e, "webcam")}
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
				onclick={(e) => handle_subtool_click(e, "color")}
				size="medium"
				padded={false}
				transparent={true}
				offset={0}
			/>
			<IconButton
				Icon={Circle}
				label="Brush Size"
				onclick={(e) => handle_subtool_click(e, "size")}
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
					onclick_outside={(e) => {
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
				onclick={(e) => handle_subtool_click(e, "size")}
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
				onclick_outside={(e) => {
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
