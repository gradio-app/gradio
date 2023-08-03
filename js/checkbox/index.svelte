<script lang="ts">
	import StaticCheckbox from "./static";
	import InteractiveCheckbox from "./interactive";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = false;
	export let value_is_output = false;
	export let label = "Checkbox";
	export let info: string | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
</script>

{#if mode === "static"}
	<StaticCheckbox
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{label}
		{info}
		{container}
		{scale}
		{min_width}
		{loading_status}
		on:change
		on:input
		on:select
	/>
{:else}
	<InteractiveCheckbox
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{label}
		{info}
		{container}
		{scale}
		{min_width}
		{loading_status}
		on:change
		on:input
		on:select
	/>
{/if}
