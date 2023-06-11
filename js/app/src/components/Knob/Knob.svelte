<script lang="ts">
	import { Knob } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: number = 0;
	export let label: string = "Knob";
	export let info: string | undefined = undefined;
	export let container: boolean = false;
	export let scale: number = 1;
	export let min_width: number | undefined = undefined;
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let mode: "static" | "dynamic";
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
	export let value_is_output: boolean = false;
</script>

<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
	<StatusTracker {...loading_status} />

	<Knob
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		{minimum}
		{maximum}
		{step}
		disabled={mode === "static"}
		on:input
		on:change
		on:release
	/>
</Block>
