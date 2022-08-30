<script lang="ts">
	import { Radio } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "Radio";
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string = "";
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";
	export let show_label: boolean;
	export let style: Styles = {};
	export let loading_status: LoadingStatus;
</script>

<Block
	{visible}
	type="fieldset"
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<Radio
		bind:value
		{label}
		{elem_id}
		{show_label}
		{choices}
		{style}
		disabled={mode === "static"}
		on:change
	/>
</Block>
