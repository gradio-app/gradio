<script lang="ts">
	import tinycolor from "tinycolor2";
	import { createEventDispatcher } from "svelte";
	export let selected_color: string;
	export let colors: string[];
	export let user_colors: (string | null)[] | null = [];
	import { Palette } from "@gradio/icons";

	export let show_empty = false;
	export let current_mode: "hex" | "rgb" | "hsl" = "hex";
	export let color_picker = false;
	const dispatch = createEventDispatcher<{
		select: { index: number | null; color: string | null };
		edit: { index: number; color: string | null };
	}>();

	$: _colors = show_empty ? colors : colors.filter((c) => c);

	function get_formatted_color(
		color: string,
		mode: "hex" | "rgb" | "hsl"
	): string {
		if (mode === "hex") {
			return tinycolor(color).toHexString();
		} else if (mode === "rgb") {
			return tinycolor(color).toRgbString();
		}
		return tinycolor(color).toHslString();
	}

	let current_index = `select-${colors.findIndex(
		(c) =>
			get_formatted_color(c, current_mode) ===
			get_formatted_color(selected_color, current_mode)
	)}`;

	function handle_select(
		type: "edit" | "select",
		detail: {
			index: number;
			color: string | null;
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
	<span class="icon-wrap">
		<Palette />
	</span>
	<div>
		{#if user_colors}
			<div class="swatch">
				{#each user_colors as color, i}
					<button
						on:click={() => handle_select("edit", { index: i, color })}
						class="color"
						class:empty={color === null}
						style="background-color: {color}"
						class:selected={`edit-${i}` === current_index}
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
			{#each _colors as color, i}
				<button
					on:click={() => handle_select("select", { index: i, color })}
					class="color"
					class:empty={color === null}
					style="background-color: {color}"
					class:selected={`select-${i}` === current_index}
				></button>
			{/each}
		</menu>
	</div>
</div>

<style>
	.icon-wrap {
		width: 18px;
		margin-top: 6px;

		margin-left: var(--size-4);
	}

	.swatch-wrap {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	span {
		margin-top: 0px;
	}

	span.lg {
		margin-top: var(--spacing-xl);
	}
	.swatch {
		display: flex;
		gap: var(--size-2-5);
		justify-content: space-around;
		margin-bottom: var(--size-2);
		margin-right: var(--size-6);
		padding-left: var(--size-2);
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
		width: 30px;
		height: 30px;
		border-radius: 50%;
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
		align-content: center;
		content: "⨯";
		color: white;
		font-size: var(--scale-5);
		position: absolute;
		width: 100%;
		height: 100%;
		transform: translateY(-17px);
		opacity: 1;
		transition: 0.1s;
		top: 0;
	}

	.colorpicker.hidden::after,
	.colorpicker.hidden::before {
		opacity: 0;
	}
</style>
