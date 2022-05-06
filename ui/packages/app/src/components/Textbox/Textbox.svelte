<svelte:options accessors={true} />

<script lang="ts">
	import { TextBox } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Textbox";
	export let value: string = "";
	export let default_value: string | false = false;
	export let style: string = "";
	export let lines: number;
	export let placeholder: string = "";
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;
	export let max_lines: number | false;

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Block {form_position}>
	<StatusTracker {...loading_status} />

	<TextBox
		bind:value
		{label}
		{show_label}
		{style}
		{lines}
		max_lines={!max_lines && mode === "static" ? lines + 1 : max_lines}
		{placeholder}
		on:change
		on:submit
		disabled={mode === "static"}
	/>
</Block>
