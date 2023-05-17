<svelte:options accessors={true} />

<script lang="ts">
	import { ColorPicker } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "ColorPicker";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string;
	export let value_is_output: boolean = false;
	export let show_label: boolean;

	export let style: Styles = {};

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<ColorPicker
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		on:change
		on:input
		on:submit
		on:blur
		disabled={mode === "static"}
	/>
</Block>
