<script lang="ts">
	import { Range } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let value: number = 0;

	export let label: string = "Slider";

	export let style: Record<string, string> = {};
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let mode: "static" | "dynamic";
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
</script>

<Block {form_position} style={style["container"]}>
	<StatusTracker {...loading_status} />

	<Range
		bind:value
		{label}
		{show_label}
		{style}
		{minimum}
		{maximum}
		{step}
		disabled={mode === "static"}
		on:change
	/>
</Block>
