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
	export let multiselect: boolean = false;
	export let max_choices: number;
	export let choices: Array<string>;
	export let show_label: boolean;
	export let show_clear_button: boolean = false;
	export let cleared_value: string | undefined;
	export let style: Styles = {};
	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";

	if (!value) {
		if (multiselect) {
			value = [];
		} else {
			value = cleared_value || "";
		}
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
		{choices}
		{multiselect}
		{max_choices}
		{label}
		{info}
		{show_label}
		{show_clear_button}
		{cleared_value}
		on:change
		on:select
		disabled={mode === "static"}
	/>
</Block>
