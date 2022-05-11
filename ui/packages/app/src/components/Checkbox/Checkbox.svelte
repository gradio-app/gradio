<script lang="ts">
	import { Checkbox } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let value: boolean = false;
	export let style: Record<string, string> = {};
	export let label: string = "Checkbox";
	export let mode: "static" | "dynamic";
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
</script>

<Block {form_position} style={style["container"]}>
	<StatusTracker {...loading_status} />

	<Checkbox
		{style}
		{label}
		{show_label}
		bind:value
		on:change
		disabled={mode === "static"}
	/>
</Block>
