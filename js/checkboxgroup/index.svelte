<script lang="ts">
	import StaticCheckboxgroup from "./static";
	import InteractiveCheckboxgroup from "./interactive";

	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string[] = [];
	export let value_is_output = false;
	export let choices: string[];
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let label = "Checkbox Group";
	export let info: string | undefined = undefined;
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
</script>

{#if mode === "static"}
	<StaticCheckboxgroup
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{choices}
		{container}
		{scale}
		{min_width}
		{label}
		{info}
		{show_label}
		{loading_status}
		on:select
		on:change
		on:input
	/>
{:else}
	<InteractiveCheckboxgroup
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{choices}
		{container}
		{scale}
		{min_width}
		{label}
		{info}
		{show_label}
		{loading_status}
		on:select
		on:change
		on:input
	/>
{/if}
