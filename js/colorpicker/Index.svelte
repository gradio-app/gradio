<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseColorPicker } from "./shared/Colorpicker.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import Colorpicker from "./shared/Colorpicker.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import exp from "constants";

	export let label = "ColorPicker";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let value_is_output = false;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: never;
		input: never;
		submit: never;
		blur: never;
		focus: never;
	}>;
	export let interactive: boolean;
</script>

<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<Colorpicker
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		disabled={!interactive}
		on:change={() => gradio.dispatch("change")}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:blur={() => gradio.dispatch("blur")}
		on:focus={() => gradio.dispatch("focus")}
	/>
</Block>
