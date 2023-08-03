<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";

	import Number from "./static";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let label = "Number";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let value = 0;
	export let show_label: boolean;
	export let minimum: number | undefined = undefined;
	export let maximum: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let mode: "static" | "dynamic";
	export let value_is_output = false;
	export let step: number | null = null;
</script>

{#if mode === "static"}
	<Static
		bind:value
		bind:value_is_output
		{label}
		{info}
		{elem_id}
		{elem_classes}
		{visible}
		{container}
		{scale}
		{min_width}
		{show_label}
		{minimum}
		{maximum}
		{loading_status}
		{step}
		on:change
		on:input
		on:submit
		on:blur
		on:focus
	></Static>
{:else}
	<Interactive
		bind:value
		bind:value_is_output
		{label}
		{info}
		{elem_id}
		{elem_classes}
		{visible}
		{container}
		{scale}
		{min_width}
		{show_label}
		{minimum}
		{maximum}
		{step}
		{loading_status}
		on:change
		on:input
		on:submit
		on:blur
		on:focus
	></Interactive>
{/if}
