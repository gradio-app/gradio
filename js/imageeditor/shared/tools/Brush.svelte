<script lang="ts" context="module">
	import { type ColorInput } from "tinycolor2";

	export interface Eraser {
		/**
		 * The default size of the eraser.
		 */
		default_size: number | "auto";
		/**
		 * The sizes to show in the size swatch
		 */
		sizes: number[] | "auto";
		/**
		 * Whether to show _only_ the sizes specified in `sizes`, or to show the sizes specified in `sizes` along with the size slider.
		 */
		size_mode: "fixed" | "defaults";
		/**
		 * Whether to use antialiasing when drawing the eraser.
		 */
		antialias: boolean;
	}

	export interface Brush extends Eraser {
		/**
		 * The default color of the brush.
		 */
		default_color: ColorInput;
		/**
		 * The colors to show in the color swatch
		 */
		colors: ColorInput[];
		/**
		 * Whether to show _only_ the color swatches specified in `colors`, or to show the color swatches specified in `colors` along with the colorpicker.
		 */
		color_mode: "fixed" | "defaults";
	}

	type brush_option_type = "color" | "size";
</script>

<script lang="ts">
	import tinycolor from "tinycolor2";
	import { clamp } from "../utils/pixi";

	import { getContext, onDestroy, onMount, tick } from "svelte";
	import { type ToolContext, TOOL_KEY } from "./Tools.svelte";
	import {
		Brush as BrushIcon,
		Palette,
		BrushSize as SizeIcon
	} from "@gradio/icons";
	import { type EditorContext, EDITOR_KEY } from "../ImageEditor.svelte";
	import { draw_path, type DrawCommand } from "./brush";
	import BrushColor from "./BrushColor.svelte";
	import BrushSize from "./BrushSize.svelte";

	export let antialias: Brush["antialias"];
	export let default_size: Brush["default_size"];
	export let sizes: Brush["sizes"];
	export let size_mode: Brush["size_mode"];
	export let default_color: Brush["default_color"] | undefined = undefined;
	export let colors: Brush["colors"] | undefined = undefined;
	export let color_mode: Brush["color_mode"] | undefined = undefined;
	export let mode: "erase" | "draw";

	let _sizes: number[];
	let selected_color = process_color(default_color);

	const paint_meta = {
		color: {
			icon: Palette,
			label: "Color",
			order: 0,
			id: "brush_color",
			cb() {
				current_option = "color";
			}
		},
		size: {
			icon: SizeIcon,
			label: "Size",
			order: 1,
			id: "brush_size",
			cb() {
				current_option = "size";
			}
		}
	} as const;

	let brush_options: (typeof paint_meta)[brush_option_type][];
	$: brush_options = Object.entries(paint_meta)
		.filter(([k]) => {
			if (k === "color") {
				return (mode !== "erase" && color_mode !== "fixed") || !!colors;
			} else if (k === "size") {
				return size_mode !== "fixed" || !!sizes;
			}

			return false;
		})
		.map(([, v]) => v);

	let current_option: brush_option_type | null = null;

	const { pixi, dimensions, current_layer, command_manager } =
		getContext<EditorContext>(EDITOR_KEY);
	const { active_tool, register_tool } = getContext<ToolContext>(TOOL_KEY);
	let drawing = false;
	let draw: DrawCommand;

	function generate_sizes(x: number, y: number): number[] {
		const min = clamp(Math.min(x, y), 500, 1000);

		return [1, 2, 3, 4].map((i) => (min / 100) * i);
	}

	$: _sizes = generate_sizes(...$dimensions);
	// $: selected_size =
	// 	_sizes[_sizes?.findIndex((c) => c === default_size)] || _sizes[0];

	let selected_size = default_size;

	async function add_listeners(): Promise<void> {
		await tick();

		$pixi?.layer_container.on("pointerdown", function (event) {
			if ($active_tool !== mode) {
				return;
			}
			drawing = true;

			if (!$pixi || !$current_layer) {
				return;
			}

			draw = draw_path(
				$pixi.renderer!,
				$pixi.layer_container,
				$current_layer,
				mode
			);

			draw.start({
				x: event.screen.x,
				y: event.screen.y,
				color: selected_color || undefined,
				size: selected_size,
				opacity: 1
			});
		});

		$pixi?.layer_container.on("pointerup", function (event) {
			if (!$pixi || !$current_layer) {
				return;
			}
			if ($active_tool !== mode) {
				return;
			}
			draw.stop();
			command_manager.execute(draw);
			drawing = false;
		});

		$pixi?.layer_container.on("pointermove", function (event) {
			if ($active_tool !== mode) {
				return;
			}
			if (drawing) {
				draw.continue({
					x: event.screen.x,
					y: event.screen.y
				});
			}
		});
	}

	onMount(() => {
		add_listeners();
		return register_tool(mode, {
			default: null,
			options: brush_options
		});
	});

	let recent_colors: (string | null)[] = [null, null, null];

	function process_color(color: ColorInput): string {
		return tinycolor(color).toRgbString();
	}

	const processed_colors = colors
		? colors.map(process_color).filter((_, i) => i < 5)
		: [];
</script>

<svelte:window
	on:keydown={({ key }) => key === "Escape" && (current_option = null)}
/>

{#if current_option === "color" && colors}
	<div>
		<BrushColor
			colors={processed_colors}
			bind:selected_color
			on:click_outside={() => (current_option = null)}
			{color_mode}
			bind:recent_colors
		/>
	</div>
{:else if current_option === "size" && sizes}
	<BrushSize
		sizes={_sizes}
		max={$dimensions[0] / 10}
		min={1}
		bind:selected_size
		on:click_outside={() => (current_option = null)}
		{size_mode}
	/>
{/if}
