<svelte:options accessors={true} />

<script lang="ts">
	import StaticColorpicker from "./static";
	import InteractiveColorpicker from "./interactive";

	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let label = "ColorPicker";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let value_is_output = false;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let mode: "static" | "dynamic";
	export let interactive: boolean;
</script>

{#if mode === "static"}
	<StaticColorpicker
		{label}
		{info}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{show_label}
		{container}
		{scale}
		{min_width}
		{loading_status}
		{interactive}
		on:change
		on:input
		on:submit
		on:blur
		on:focus
	/>
{:else}
	<InteractiveColorpicker
		{label}
		{info}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{show_label}
		{container}
		{scale}
		{min_width}
		{loading_status}
		{interactive}
		on:change
		on:input
		on:submit
		on:blur
		on:focus
	/>
{/if}
