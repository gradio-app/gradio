<script lang="ts">
	import { Number } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";

	export let label: string = "Number";
	export let value: number = 0;
	export let default_value: number;
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let loading_status: "complete" | "pending" | "error";

	export let style: string = "";

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Block {form_position}>
	<StatusTracker tracked_status={loading_status} />

	<Number
		bind:value
		{label}
		{show_label}
		{style}
		disabled={mode === "static"}
		on:change
		on:submit
	/>
</Block>
