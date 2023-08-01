<script lang="ts">
	import Radio from "./static";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let label = "Radio";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | null = null;
	export let value_is_output = false;
	export let choices: string[] = [];
	export let mode: "static" | "dynamic";
	export let show_label: boolean;
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
</script>

<Block
	{visible}
	type="fieldset"
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />

	<Radio
		bind:value
		bind:value_is_output
		{label}
		{info}
		{elem_id}
		{show_label}
		{choices}
		disabled={mode === "static"}
		on:change
		on:input
		on:select
	/>
</Block>
