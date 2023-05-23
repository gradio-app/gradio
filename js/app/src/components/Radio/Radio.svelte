<script lang="ts">
	import { Radio } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Radio";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string | null = null;
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";
	export let show_label: boolean;
	export let container: boolean = false;
	export let scale: number = 1;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
</script>

<Block
	{visible}
	type="fieldset"
	{elem_id}
	{elem_classes}
	disable={container === false}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />

	<Radio
		bind:value
		{label}
		{info}
		{elem_id}
		{show_label}
		{choices}
		{style}
		disabled={mode === "static"}
		on:change
		on:select
	/>
</Block>
