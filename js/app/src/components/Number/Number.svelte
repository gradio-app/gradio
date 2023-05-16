<script lang="ts">
	import { Number } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "Number";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let style: Styles = {};
	export let value: number = 0;
	export let show_label: boolean;
	export let max: number | undefined = undefined;
	export let min: number | undefined = undefined;

	export let loading_status: LoadingStatus;
	export let mode: "static" | "dynamic";
	export let value_is_output: boolean = false;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<Number
		bind:value
<<<<<<< HEAD
		bind:max
		bind:min
=======
		bind:value_is_output
>>>>>>> 96b38fda0 (Input listener (#4157))
		{label}
		{info}
		{show_label}
		disabled={mode === "static"}
		on:change
		on:input
		on:submit
		on:blur
	/>
</Block>
