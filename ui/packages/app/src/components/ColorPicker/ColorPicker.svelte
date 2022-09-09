<svelte:options accessors={true} />

<script lang="ts">
	import { ColorPicker } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "ColorPicker";
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string;
	export let show_label: boolean;

	export let style: Styles = {};

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";
</script>

<Block
	{visible}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<ColorPicker
		{style}
		bind:value
		{label}
		{show_label}
		on:change
		on:submit
		disabled={mode === "static"}
	/>
</Block>
