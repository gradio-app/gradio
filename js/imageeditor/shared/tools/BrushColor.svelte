<script lang="ts">
	import { type Brush } from "./Brush.svelte";
	import ColorPicker from "./ColorPicker.svelte";
	import ColorSwatch from "./ColorSwatch.svelte";
	import ColorField from "./ColorField.svelte";
	export let colors: string[];
	export let selected_color: string;
	export let color_mode: Brush["color_mode"] | undefined = undefined;
	export let recent_colors: (string | null)[] = [];

	let color_picker = false;
	let current_mode: "hex" | "rgb" | "hsl" = "hex";
	let editing_index: number | null = null;

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
</script>

<div class="wrap" class:padded={!color_picker}>
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
	<ColorSwatch
		bind:color_picker
		{colors}
		on:select={({ detail }) => handle_color_selection(detail, "core")}
		on:edit={({ detail }) => handle_color_selection(detail, "user")}
		user_colors={color_mode === "defaults" ? recent_colors : null}
		{selected_color}
		{current_mode}
	/>
</div>

<style>
	.wrap {
		width: 230px;
		position: absolute;
		bottom: 85px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		background: var(--background-fill-secondary);
		border: 1px solid var(--block-border-color);

		border-radius: var(--radius-md);
		box-shadow:
			0 0 5px rgba(0, 0, 0, 0.1),
			0 5px 30px rgba(0, 0, 0, 0.2);
		padding-bottom: var(--size-2);
	}
	.padded {
		padding-top: var(--size-3);
	}
</style>
