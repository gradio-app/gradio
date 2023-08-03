<svelte:options accessors={true} />

<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";

	import type { LoadingStatus } from "@gradio/statustracker";

	export let label = "Textbox";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = "";
	export let lines: number;
	export let placeholder = "";
	export let show_label: boolean;
	export let max_lines: number;
	export let type: "text" | "password" | "email" = "text";
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let show_copy_button = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let value_is_output = false;
	export let rtl = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autofocus = false;
</script>

{#if mode === "static"}
	<Static
		{label}
		{info}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{lines}
		{placeholder}
		{show_label}
		{max_lines}
		{type}
		{container}
		{scale}
		{min_width}
		{show_copy_button}
		{loading_status}
		bind:value_is_output
		{rtl}
		{text_align}
		{autofocus}
		on:change
		on:input
		on:submit
		on:blur
		on:select
		on:focus
	></Static>
{:else}
	<Interactive
		{label}
		{info}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{lines}
		{placeholder}
		{show_label}
		{max_lines}
		{type}
		{container}
		{scale}
		{min_width}
		{show_copy_button}
		{loading_status}
		bind:value_is_output
		{rtl}
		{text_align}
		{autofocus}
		on:change
		on:input
		on:submit
		on:blur
		on:select
		on:focus
	></Interactive>
{/if}
