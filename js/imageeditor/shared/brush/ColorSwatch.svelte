<script lang="ts">
	import tinycolor from "tinycolor2";
	import { createEventDispatcher } from "svelte";
	import type { ColorTuple } from "./types";
	import type { ColorInput } from "tinycolor2";
	import IconButton from "../IconButton.svelte";
	import { Plus } from "@gradio/icons";

	export let selected_color: string;
	export let colors: (ColorInput | ColorTuple)[];
	export let user_colors: (ColorInput | ColorTuple)[] | null = [];

	export let show_empty = false;
	export let current_mode: "hex" | "rgb" | "hsl" = "hex";
	export let color_picker = false;
	const dispatch = createEventDispatcher<{
		select: { index: number | null; color: string | null; opacity?: number };
		edit: { index: number; color: string | null };
		add_color: void;
	}>();

	$: _colors = show_empty ? colors : colors.filter((c) => c);

	function get_color(color_input: ColorInput | ColorTuple): string {
		if (Array.isArray(color_input)) {
			return color_input[0] as string;
		}
		return color_input as string;
	}

	function get_opacity(
		color_input: ColorInput | ColorTuple
	): number | undefined {
		if (Array.isArray(color_input)) {
			return color_input[1];
		}

		const color = tinycolor(color_input);
		return color.getAlpha();
	}

	function get_formatted_color(
		color: ColorInput | ColorTuple,
		mode: "hex" | "rgb" | "hsl"
	): string {
		const color_value = get_color(color);
		if (mode === "hex") {
			return tinycolor(color_value).toHexString();
		} else if (mode === "rgb") {
			return tinycolor(color_value).toRgbString();
		}
		return tinycolor(color_value).toHslString();
	}

	let current_index = `select-${colors.findIndex(
		(c) =>
			get_formatted_color(c, current_mode) ===
			get_formatted_color(selected_color, current_mode)
	)}`;

	$: selected_opacity = get_opacity(selected_color);

	function handle_select(
		type: "edit" | "select",
		detail: {
			index: number;
			color: string | null;
			opacity?: number;
		}
	): void {
		current_index = `${type}-${detail.index}`;
		dispatch(type, detail);
	}

	function handle_picker_click(): void {
		dispatch("select", { index: null, color: selected_color });
		color_picker = !color_picker;
	}
</script>

{#if !color_picker}
	<span class:lg={user_colors}></span>
{/if}

<div class="swatch-wrap">
	<div class="swatch-container">
		{#if user_colors}
			<div class="swatch">
				{#if color_picker}
					<IconButton
						Icon={Plus}
						on:click={() => dispatch("add_color")}
						roundedness="very"
						background={get_color(selected_color)}
						color="white"
					/>
				{/if}
				{#each user_colors as color, i}
					{@const color_string = get_color(color)}
					{@const opacity = get_opacity(color)}
					<button
						on:click={() =>
							handle_select("edit", {
								index: i,
								color: color_string,
								opacity: opacity
							})}
						class="color"
						class:empty={color === null}
						style="background-color: {color_string}"
						style:opacity
						class:selected={`${color_string}-${opacity}` ===
							`${selected_color}-${selected_opacity}`}
					></button>
				{/each}

				<button
					on:click={handle_picker_click}
					class="color colorpicker"
					class:hidden={!color_picker}
				></button>
			</div>
		{/if}
		<menu class="swatch">
			{#each _colors as color_item, i}
				{@const color_string = get_color(color_item)}
				{@const opacity = get_opacity(color_item)}
				<button
					on:click={() =>
						handle_select("select", {
							index: i,
							color: color_string,
							opacity: opacity
						})}
					class="color"
					class:empty={color_item === null}
					style="background-color: {color_string}"
					style:opacity
					class:selected={`${color_string}-${opacity}` ===
						`${selected_color}-${selected_opacity}`}
				></button>
			{/each}
		</menu>
	</div>
</div>

<style>
	.swatch-wrap {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		/* max-width: 200px; */
		width: 205px;
	}

	span.lg {
		margin-top: var(--spacing-sm);
	}
	.swatch-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}
	.swatch {
		display: grid;
		grid-template-columns: repeat(auto-fill, 25px);
		gap: 8px;
		justify-content: flex-start;

		overflow: hidden;
		justify-content: center;
	}

	.empty {
		border: 1px solid var(--block-border-color);
		font-weight: var(--weight-bold);
		display: flex;
		justify-content: center;
		align-items: center;
		padding-top: 4px;
		text-align: center;
		font-size: var(--scale-0);
		cursor: pointer;
	}

	.empty::after {
		content: "+";
		margin-bottom: var(--size-1);
	}

	.color {
		width: 25px;
		height: 25px;
		border-radius: var(--radius-md);
	}

	.empty.selected,
	.color.selected {
		border: 2px solid var(--color-accent);
	}

	.colorpicker {
		border: 1px solid var(--block-border-color);

		background: conic-gradient(
			red,
			#ff0 60deg,
			lime 120deg,
			cyan 180deg,
			blue 240deg,
			magenta 300deg,
			red 360deg
		);
		overflow: hidden;
		position: relative;
		color: white;
		cursor: pointer;
	}

	.colorpicker::before {
		content: "";
		position: absolute;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		opacity: 1;
		transition: 0.1s;
		top: 0;
		left: 0;
	}

	.colorpicker::after {
		display: flex;
		justify-content: center;
		align-items: center;
		content: "⨯";
		color: white;
		font-size: var(--scale-5);
		position: absolute;
		width: 100%;
		height: 100%;
		transform: translateY(-7px);
		opacity: 1;
		transition: 0.1s;
		top: 0;
	}

	.colorpicker.hidden::after,
	.colorpicker.hidden::before {
		opacity: 0;
	}
</style>
