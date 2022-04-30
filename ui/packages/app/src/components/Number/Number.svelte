<script lang="ts">
	import { Number } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Number";
	export let elem_id: string = "";
	export let style: Record<string, any> = {};
	export let value: number = 0;
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
	export let mode: "static" | "dynamic";
</script>

<Block {form_position} {elem_id} {style}>
	<StatusTracker {...loading_status} />

	<Number
		bind:value
		{label}
		{integer}
		{show_label}
		{style}
		disabled={mode === "static"}
		on:change
		on:submit
	/>
</Block>
