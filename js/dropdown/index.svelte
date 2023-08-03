<script lang="ts">
	import StaticDropdown from "./static";
	import InteractiveDropdown from "./interactive";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let label = "Dropdown";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | string[];
	export let value_is_output = false;
	export let multiselect = false;
	export let max_choices: number;
	export let choices: string[];
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let allow_custom_value = false;

	export let mode: "static" | "dynamic";

	if (multiselect && !value) {
		value = [];
	} else if (!value) {
		value = "";
	}
</script>

{#if mode === "static"}
	<StaticDropdown
		{visible}
		{elem_id}
		{elem_classes}
		{container}
		{scale}
		{min_width}
		bind:value
		bind:value_is_output
		{choices}
		{multiselect}
		{max_choices}
		{label}
		{info}
		{show_label}
		{allow_custom_value}
		{loading_status}
		on:change
		on:input
		on:select
		on:blur
		on:focus
	/>
{:else}
	<InteractiveDropdown
		{visible}
		{elem_id}
		{elem_classes}
		{container}
		{scale}
		{min_width}
		bind:value
		bind:value_is_output
		{choices}
		{multiselect}
		{max_choices}
		{label}
		{info}
		{show_label}
		{allow_custom_value}
		{loading_status}
		on:change
		on:input
		on:select
		on:blur
		on:focus
	/>
{/if}
