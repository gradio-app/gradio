<script lang="ts">
	import { Checkbox } from "@gradio/form";
	import { Block, Info } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: boolean = false;
	export let value_is_output: boolean = false;
	export let label: string = "Checkbox";
	export let info: string | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let style: Styles = {};
	export let loading_status: LoadingStatus;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	{#if info}
		<Info>{info}</Info>
	{/if}
	<Checkbox
		{label}
		bind:value
		bind:value_is_output
		on:change
		on:input
		on:select
		disabled={mode === "static"}
	/>
</Block>
