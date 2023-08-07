<svelte:options accessors={true} />

<script lang="ts">
	import Colorpicker from "../shared";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";

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
	export let interactive = true;
</script>

<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
	<StatusTracker {...loading_status} />

	<Colorpicker
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		disabled={!interactive}
		on:change
		on:input
		on:submit
		on:blur
		on:focus
	/>
</Block>
