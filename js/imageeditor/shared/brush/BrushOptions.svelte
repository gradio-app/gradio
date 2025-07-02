<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { click_outside } from "../utils/events";

	import { type Brush, type ColorTuple } from "./types";
	import ColorPicker from "./ColorPicker.svelte";
	import ColorSwatch from "./ColorSwatch.svelte";
	import ColorField from "./ColorField.svelte";
	import BrushSize from "./BrushSize.svelte";
	import type { ColorInput } from "tinycolor2";

	export let colors: (ColorInput | ColorTuple)[];
	export let selected_color: any;
	export let color_mode: Brush["color_mode"] | undefined = undefined;
	export let recent_colors: (ColorInput | ColorTuple)[] = [];
	export let selected_size: number;
	export let selected_opacity: number;
	export let show_swatch: boolean;
	export let show_size: boolean;
	export let mode: "brush" | "eraser" = "brush";

	let color_picker = false;
	let current_mode: "hex" | "rgb" | "hsl" = "hex";
	let editing_index: number | null = null;

	const dispatch = createEventDispatcher<{
		click_outside: void;
	}>();

	function handle_color_selection(
		{
			index,
			color,
			opacity
		}: {
			index: number | null;
			color: string | null;
			opacity?: number;
		},
		type: "core" | "user"
	): void {
		if (type === "user" && !color) {
			editing_index = index;
			color_picker = true;
		}

		if (!color) return;
		selected_color = color;

		if (opacity !== undefined) {
			selected_opacity = opacity;
		}

		if (type === "core") {
			color_picker = false;
		}
	}

	function handle_color_change(color: string): void {
		if (editing_index === null) return;
		recent_colors[editing_index] = color;
	}

	$: handle_color_change(selected_color);
	let width = 0;
	let height = 0;

	function debounce(
		func: (...args: any[]) => void,
		delay: number
	): (...args: any[]) => void {
		let timeout: NodeJS.Timeout;
		return function (...args: any[]): void {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), delay);
		};
	}

	export let preview = false;
	function handle_preview(): void {
		if (!preview) {
			preview = true;
			debounced_close_preview();
		} else {
			debounced_close_preview();
		}
	}

	function handle_close_preview(): void {
		preview = false;
	}

	const debounced_close_preview = debounce(handle_close_preview, 1000);

	$: selected_size, selected_color, handle_preview();

	function handle_select(color: string): void {
		selected_color = color;
	}

	function handle_add_color(): void {
		// limit to 5
		if (recent_colors.length >= 5) {
			recent_colors.pop();
		}
		// check if the color is already in the array
		if (
			recent_colors.some((color) => {
				if (Array.isArray(color)) {
					return color[0] === selected_color && color[1] === selected_opacity;
				}
				return color === selected_color;
			})
		) {
			return;
		}
		recent_colors.push([selected_color, selected_opacity]);
		recent_colors = recent_colors;
	}
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

<div
	class="wrap"
	class:padded={!color_picker}
	use:click_outside={() => dispatch("click_outside")}
	class:color_picker
	class:size_picker={show_size && mode === "brush"}
	class:eraser_picker={mode === "eraser"}
>
	{#if color_mode === "defaults"}
		{#if color_picker}
			<ColorPicker
				bind:color={selected_color}
				bind:opacity={selected_opacity}
			/>
			<ColorField
				bind:current_mode
				color={selected_color}
				on:close={() => (color_picker = false)}
				on:selected={({ detail }) => handle_select(detail)}
			/>
		{/if}
	{/if}
	{#if show_swatch}
		<ColorSwatch
			bind:color_picker
			{colors}
			on:select={({ detail }) => handle_color_selection(detail, "core")}
			on:edit={({ detail }) => handle_color_selection(detail, "user")}
			user_colors={color_mode === "defaults" ? recent_colors : null}
			{selected_color}
			{current_mode}
			on:add_color={handle_add_color}
		/>
	{/if}

	{#if show_size}
		<BrushSize max={100} min={1} bind:selected_size />
	{/if}
</div>

<style>
	.wrap {
		max-width: 230px;
		/* width: 90%; */
		position: absolute;
		display: flex;
		flex-direction: column;
		gap: 5px;
		background: var(--background-fill-secondary);
		border: 1px solid var(--block-border-color);
		border-radius: var(--radius-md);
		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
		padding-bottom: var(--size-2);
		pointer-events: all;
		cursor: default;
		z-index: var(--layer-top);
		overflow: hidden;
		top: 0;

		transform: translate(35px, -12px);
	}

	.color_picker {
		transform: translate(35px, -50%);
	}

	.size_picker {
		transform: translate(35px, 18px);
	}

	.eraser_picker {
		transform: translate(35px, -7px);
	}
</style>
