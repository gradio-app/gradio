<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { click_outside } from "../utils/events";

	import { type Brush } from "./Brush.svelte";
	import ColorPicker from "./ColorPicker.svelte";
	import ColorSwatch from "./ColorSwatch.svelte";
	import ColorField from "./ColorField.svelte";
	import BrushSize from "./BrushSize.svelte";

	export let colors: string[];
	export let selected_color: string;
	export let color_mode: Brush["color_mode"] | undefined = undefined;
	export let recent_colors: (string | null)[] = [];
	export let selected_size: number;
	export let dimensions: [number, number];
	export let parent_width: number;
	export let parent_height: number;
	export let parent_left: number;
	export let toolbar_box: DOMRect | Record<string, never>;
	export let show_swatch: boolean;

	let color_picker = false;
	let current_mode: "hex" | "rgb" | "hsl" = "hex";
	let editing_index: number | null = null;

	const dispatch = createEventDispatcher<{
		click_outside: void;
	}>();

	function handle_color_selection(
		{
			index,
			color
		}: {
			index: number | null;
			color: string | null;
		},
		type: "core" | "user"
	): void {
		if (type === "user" && !color) {
			editing_index = index;
			color_picker = true;
		}

		if (!color) return;
		selected_color = color;

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
	let c_width = 0;
	let c_height = 0;
	let wrap_el: HTMLDivElement;
	let full_screen = false;
	let anchor: "default" | "center" | "top" = "default";
	let left_anchor = 0;
	let top_anchor = null;
	$: {
		if (wrap_el && (width || height || c_height || c_width)) {
			const box = wrap_el.getBoundingClientRect();
			color_picker;

			if (box.width > parent_width) {
				full_screen = true;
			} else if (parent_width > box.width + 230 * 2 + 25) {
				anchor = "default";

				left_anchor = toolbar_box.right - parent_left + 24;
			} else {
				anchor = "center";
			}

			if (box.height + 50 > parent_height) {
				anchor = "top";
				top_anchor = true;
			}
		}
	}
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} />

<div
	class="wrap"
	class:padded={!color_picker}
	use:click_outside={() => dispatch("click_outside")}
	class:anchor_default={anchor === "default"}
	class:anchor_center={anchor === "center"}
	class:anchor_top={anchor === "top"}
	bind:this={wrap_el}
	bind:clientWidth={c_width}
	bind:clientHeight={c_height}
	class:anchor={`${left_anchor}px`}
>
	{#if color_mode === "defaults"}
		{#if color_picker}
			<ColorPicker bind:color={selected_color} />
			<ColorField
				bind:current_mode
				color={selected_color}
				on:close={() => (color_picker = false)}
				on:selected={({ detail }) => (selected_color = detail)}
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
		/>
	{/if}

	{#if color_picker || show_swatch}
		<div class="sep"></div>
	{/if}

	<BrushSize max={dimensions[0] / 10} min={1} bind:selected_size />
</div>

<style>
	.wrap {
		max-width: 230px;
		width: 90%;
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
	}

	.anchor_default {
		position: absolute;
		left: var(--left-anchor);
		bottom: 8px;
	}
	.anchor_center {
		position: absolute;
		bottom: 50px;
		left: 50%;
		transform: translateX(-50%);
	}

	.anchor_top {
		position: absolute;
		top: 1px;
		left: 50%;
		transform: translateX(-50%);
	}

	.sep {
		height: 1px;
		background-color: var(--block-border-color);
		margin: 0 var(--size-3);
		margin-top: var(--size-1);
	}
</style>
