<svelte:options accessors={true} />

<script lang="ts">
	import { TextBox } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "Textbox";
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string = "";
	export let lines: number;
	export let placeholder: string = "";
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;
	export let max_lines: number | false;

	export let style: Styles = {};

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";
</script>

<Block
	{visible}
	{form_position}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<TextBox
		{style}
		bind:value
		{label}
		{show_label}
		{lines}
		max_lines={!max_lines && mode === "static" ? lines + 1 : max_lines}
		{placeholder}
		on:change
		on:submit
		disabled={mode === "static"}
	/>
</Block>
