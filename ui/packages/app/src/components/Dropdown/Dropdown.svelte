<script lang="ts">
	import { Dropdown } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Dropdown";
	export let elem_id: string = "";
	export let value: string = "";
	export let choices: Array<string>;
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;
	export let style: Record<string, any> = {};

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";
</script>

<Block {form_position} {elem_id} {style}>
	<StatusTracker {...loading_status} />

	<Dropdown
		bind:value
		{choices}
		{label}
		{show_label}
		{style}
		on:change
		disabled={mode === "static"}
	/>
</Block>
