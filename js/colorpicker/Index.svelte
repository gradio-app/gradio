<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseColorPicker } from "./shared/Colorpicker.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import Colorpicker from "./shared/Colorpicker.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { ColorPickerProps, ColorPickerEvents } from "./types";

	let props = $props();
	const gradio = new Gradio<ColorPickerEvents, ColorPickerProps>(props);
	let label = $derived(
		gradio.shared.label || gradio.i18n("colorpicker.color_picker")
	);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on:clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>

	<Colorpicker
		bind:value={gradio.props.value}
		{label}
		info={gradio.props.info}
		show_label={gradio.shared.show_label}
		disabled={!gradio.shared.interactive}
		on:change={() => gradio.dispatch("change")}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:blur={() => gradio.dispatch("blur")}
		on:focus={() => gradio.dispatch("focus")}
	/>
</Block>
