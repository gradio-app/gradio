<script lang="ts">
	import { Radio } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Radio";
	export let value: string = "";
	export let style: Record<string, string> = {};
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
</script>

<Block {form_position} type="fieldset" style={style["container"]}>
	<StatusTracker {...loading_status} />

	<Radio
		{form_position}
		bind:value
		{label}
		{show_label}
		{style}
		{choices}
		disabled={mode === "static"}
		on:change
	/>
</Block>
