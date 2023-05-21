<script lang="ts">
	import { Dropdown } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";

	export let label: string = "Dropdown";
	export let info: string | undefined = undefined;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string | Array<string>;
	export let value_is_output: boolean = false;
	export let multiselect: boolean = false;
	export let max_choices: number;
	export let choices: Array<string>;
	export let show_label: boolean;
	export let style: Styles = {};
	export let loading_status: LoadingStatus;
	export let allow_custom_value: boolean = false;

	export let mode: "static" | "dynamic";

	if (multiselect && !value) {
		value = [];
	} else if (!value) {
		value = "";
	}
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />

	<Dropdown
		bind:value
		bind:value_is_output
		{choices}
		{multiselect}
		{max_choices}
		{label}
		{info}
		{show_label}
		{allow_custom_value}
		on:change
		on:input
		on:select
		on:blur
		disabled={mode === "static"}
	/>
</Block>
