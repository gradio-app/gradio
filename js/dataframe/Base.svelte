<script lang="ts">
	import Table from "./standalone/Table.svelte";

	export type I18nFormatter = (key: string, ...args: any[]) => string;

	function default_upload(file: File): Promise<string> {
		return Promise.resolve(URL.createObjectURL(file));
	}

	function default_stream_handler(endpoint: string, data: any): Promise<any> {
		return Promise.resolve(data);
	}

	export let value: (string | number)[][] = [];
	export let headers: string[] = [];
	export let datatype: any = "str";
	export let editable = true;
	export let show_row_numbers = false;
	export let max_height = 500;
	export let show_search: "none" | "search" | "filter" = "none";
	export let show_copy_button = false;
	export let show_fullscreen_button = false;
	export let wrap = false;
	export let line_breaks = true;
	export let column_widths: string[] = [];
	export let max_chars: number | undefined = undefined;
	export let pinned_columns = 0;
	export let static_columns: (string | number)[] = [];
	export let fullscreen = false;
	export let label: string | null = null;
	export let show_label = true;
	export let latex_delimiters: any[] = [];
	export let components: Record<string, any> = {};
	export let col_count: [number, "fixed" | "dynamic"] = [
		headers.length,
		"dynamic"
	];
	export let row_count: [number, "fixed" | "dynamic"] = [
		value.length,
		"dynamic"
	];
	export let root = "";
	export let i18n: I18nFormatter;
	export let upload: any = null;
	export let stream_handler: any = null;
	export let value_is_output = false;
	export let display_value: string[][] | null = null;
	export let styling: string[][] | null = null;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
</script>

<div
	class="gradio-dataframe {elem_classes.join(' ')}"
	class:visible
	id={elem_id}
>
	<Table
		values={value}
		{headers}
		{datatype}
		{editable}
		{show_row_numbers}
		{max_height}
		{show_search}
		{show_copy_button}
		{show_fullscreen_button}
		{wrap}
		{line_breaks}
		{column_widths}
		{max_chars}
		{pinned_columns}
		{static_columns}
		{fullscreen}
		{label}
		{show_label}
		{latex_delimiters}
		{components}
		{col_count}
		{row_count}
		{root}
		{i18n}
		upload={upload || default_upload}
		stream_handler={stream_handler || default_stream_handler}
		{value_is_output}
		{display_value}
		{styling}
		on:change
		on:blur
		on:keydown
		on:input
		on:select
		on:fullscreen
	/>
</div>

<style>
	.gradio-dataframe {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
