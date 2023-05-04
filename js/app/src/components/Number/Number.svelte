<script lang="ts">
	import { Number } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Number";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let container: boolean = false;
	export let value: number = 0;
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
	export let mode: "static" | "dynamic";
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	disable={container === false}
>
	<StatusTracker {...loading_status} />

	<Number
		bind:value
		{label}
		{info}
		{show_label}
		disabled={mode === "static"}
		on:change
		on:submit
		on:blur
	/>
</Block>
