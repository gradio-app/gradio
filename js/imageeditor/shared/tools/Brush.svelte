<script lang="ts" context="module">
	import { type ColorInput } from "tinycolor2";

	export interface Eraser {
		/**
		 * The default size of the eraser.
		 */
		default_size: number | "auto";
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

	import { getContext, onMount, tick } from "svelte";
	import { type ToolContext, TOOL_KEY } from "./Tools.svelte";
	import { Palette, BrushSize as SizeIcon } from "@gradio/icons";
	import { type EditorContext, EDITOR_KEY } from "../ImageEditor.svelte";
	import { draw_path, type DrawCommand } from "./brush";
	import BrushColor from "./BrushColor.svelte";
	import BrushSize from "./BrushSize.svelte";
	import type { FederatedPointerEvent } from "pixi.js";

	export let default_size: Brush["default_size"];
	export let default_color: Brush["default_color"] | undefined = undefined;
	export let colors: Brush["colors"] | undefined = undefined;
	export let color_mode: Brush["color_mode"] | undefined = undefined;
	export let mode: "erase" | "draw";

	const processed_colors = colors
		? colors.map(process_color).filter((_, i) => i < 5)
		: [];

	let selected_color =
		default_color === "auto"
			? processed_colors[0]
			: !default_color
			? "black"
			: process_color(default_color);

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
	$: brush_options =
		mode === "draw" ? Object.values(paint_meta) : [paint_meta.size];

	let current_option: brush_option_type | null = null;

	const {
		pixi,
		dimensions,
		current_layer,
		command_manager,
		register_context,
		editor_box,
		crop
	} = getContext<EditorContext>(EDITOR_KEY);

	const { active_tool, register_tool, current_color } =
		getContext<ToolContext>(TOOL_KEY);

	let drawing = false;
	let draw: DrawCommand;

	function generate_sizes(x: number, y: number): number {
		const min = clamp(Math.min(x, y), 500, 1000);

		return Math.round((min * 2) / 100);
	}

	$: mode === "draw" && current_color.set(selected_color);

	let selected_size =
		default_size === "auto" ? generate_sizes(...$dimensions) : default_size;

	function pointer_down_handler(event: FederatedPointerEvent): void {
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
	}

	function pointer_up_handler(event: FederatedPointerEvent): void {
		if (!$pixi || !$current_layer) {
			return;
		}
		if ($active_tool !== mode) {
			return;
		}
		draw.stop();
		command_manager.execute(draw);
		drawing = false;
	}

	function pointer_move_handler(event: FederatedPointerEvent): void {
		if ($active_tool !== mode) {
			return;
		}
		if (drawing) {
			draw.continue({
				x: event.screen.x,
				y: event.screen.y
			});
		}

		const x_bound = $crop[0] * $dimensions[0];
		const y_bound = $crop[1] * $dimensions[1];

		if (
			x_bound > event.screen.x ||
			y_bound > event.screen.y ||
			event.screen.x > x_bound + $crop[2] * $dimensions[0] ||
			event.screen.y > y_bound + $crop[3] * $dimensions[1]
		) {
			brush_cursor = false;
			document.body.style.cursor = "auto";
		} else {
			brush_cursor = true;
			document.body.style.cursor = "none";
		}
		if (brush_cursor) {
			pos = {
				x: event.clientX - $editor_box.child_left,
				y: event.clientY - $editor_box.child_top
			};
		}
	}

	let brush_cursor = false;

	async function toggle_listeners(on_off: "on" | "off"): Promise<void> {
		$pixi?.layer_container[on_off]("pointerdown", pointer_down_handler);

		$pixi?.layer_container[on_off]("pointerup", pointer_up_handler);

		$pixi?.layer_container[on_off]("pointermove", pointer_move_handler);
		$pixi?.layer_container[on_off](
			"pointerenter",
			(event: FederatedPointerEvent) => {
				if ($active_tool === mode) {
					brush_cursor = true;
					document.body.style.cursor = "none";
				}
			}
		);
		$pixi?.layer_container[on_off](
			"pointerleave",
			() => ((brush_cursor = false), (document.body.style.cursor = "auto"))
		);
	}

	register_context(mode, {
		init_fn: () => {
			toggle_listeners("on");
		},
		reset_fn: () => {
			toggle_listeners("off");
		}
	});

	onMount(() => {
		const unregister = register_tool(mode, {
			default: null,
			options: brush_options
		});

		return () => {
			unregister();
			toggle_listeners("off");
		};
	});

	let recent_colors: (string | null)[] = [null, null, null];

	function process_color(color: ColorInput): string {
		return tinycolor(color).toRgbString();
	}

	$: {
		if ($active_tool !== mode) {
			current_option = null;
		}
	}

	let pos = { x: 0, y: 0 };
	$: brush_size =
		(selected_size / $dimensions[0]) * $editor_box.child_width * 2;
</script>

<svelte:window
	on:keydown={({ key }) => key === "Escape" && (current_option = null)}
/>

<span
	style:transform="translate({pos.x}px, {pos.y}px)"
	style:top="{$editor_box.child_top -
		$editor_box.parent_top -
		brush_size / 2}px"
	style:left="{$editor_box.child_left -
		$editor_box.parent_left -
		brush_size / 2}px"
	style:width="{brush_size}px"
	style:height="{brush_size}px"
	style:opacity={brush_cursor ? 1 : 0}
/>

{#if current_option === "color" && colors}
	<div>
		<BrushColor
			on:click_outside={() => (current_option = null)}
			colors={processed_colors}
			bind:selected_color
			{color_mode}
			bind:recent_colors
		/>
	</div>
{:else if current_option === "size"}
	<BrushSize
		on:click_outside={() => (current_option = null)}
		max={$dimensions[0] / 10}
		min={1}
		bind:selected_size
	/>
{/if}

<style>
	span {
		position: absolute;
		background: rgba(0, 0, 0, 0.5);
		pointer-events: none;
		border-radius: 50%;
	}
</style>
