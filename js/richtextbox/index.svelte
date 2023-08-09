<script lang="ts">
	import Static from "./static";
	import Interactive from "./interactive";
	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let label = "Textbox";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: {
		text: string | null;
		files: string[] | FileData[];
	} = { text: null, files: [] };
	export let lines: number;
	export let placeholder = "";
	export let show_label: boolean;
	export let max_lines: number;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let show_copy_button = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let mode: "static" | "dynamic";
	export let rtl = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autofocus = false;
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;
</script>

{#if mode === "static"}
	<Static
		{value}
		{label}
		{info}
		{show_label}
		{elem_id}
		{elem_classes}
		{visible}
		{scale}
		{min_width}
		{loading_status}
		{lines}
		{rtl}
		{text_align}
		{max_lines}
		{placeholder}
		{show_copy_button}
		{autofocus}
		{container}
		{file_count}
		{file_types}
		{root}
		on:change
		on:input
		on:submit
		on:blur
		on:select
		on:load
	></Static>
{:else}
	<Interactive
		{value}
		{label}
		{info}
		{show_label}
		{elem_id}
		{elem_classes}
		{visible}
		{scale}
		{min_width}
		{loading_status}
		{lines}
		{rtl}
		{text_align}
		{max_lines}
		{placeholder}
		{show_copy_button}
		{autofocus}
		{container}
		{file_count}
		{file_types}
		{root}
		on:change
		on:input
		on:submit
		on:blur
		on:select
		on:load
	></Interactive>
{/if}
