<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { Block } from "@gradio/atoms";
	import Table from "./shared/Table.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Headers, Datatype, DataframeValue } from "./shared/utils";
	import Image from "@gradio/image";

	export let headers: Headers = [];
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: DataframeValue = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"],
		metadata: null
	};
	export let value_is_output = false;
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let label: string | null = null;
	export let show_label = true;
	export let wrap: boolean;
	export let datatype: Datatype | Datatype[];
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let root: string;

	export let line_breaks = true;
	export let column_widths: string[] = [];
	export let gradio: Gradio<{
		change: never;
		select: SelectData;
		input: never;
		clear_status: LoadingStatus;
		search: string | null;
	}>;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let max_height: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let interactive: boolean;
	export let show_fullscreen_button = false;
	export let max_chars: number | undefined = undefined;
	export let show_copy_button = false;
	export let show_row_numbers = false;
	export let show_search: "none" | "search" | "filter" = "none";
	export let pinned_columns = 0;
	export let static_columns: (string | number)[] = [];

	$: _headers = [...(value.headers || headers)];
	$: display_value = value?.metadata?.display_value
		? [...value?.metadata?.display_value]
		: null;
	$: styling =
		!interactive && value?.metadata?.styling
			? [...value?.metadata?.styling]
			: null;
</script>

<Block
	{visible}
	padding={false}
	{elem_id}
	{elem_classes}
	container={false}
	{scale}
	{min_width}
	overflow_behavior="visible"
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<Table
		{root}
		{label}
		{show_label}
		{row_count}
		{col_count}
		values={value.data}
		{display_value}
		{styling}
		headers={_headers}
		on:change={(e) => {
			value.data = e.detail.data;
			value.headers = e.detail.headers;
			gradio.dispatch("change");
		}}
		on:input={(e) => gradio.dispatch("input")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		{wrap}
		{datatype}
		{latex_delimiters}
		editable={interactive}
		{max_height}
		i18n={gradio.i18n}
		{line_breaks}
		{column_widths}
		upload={(...args) => gradio.client.upload(...args)}
		stream_handler={(...args) => gradio.client.stream(...args)}
		bind:value_is_output
		{show_fullscreen_button}
		{max_chars}
		{show_copy_button}
		{show_row_numbers}
		{show_search}
		{pinned_columns}
		components={{ image: Image }}
		{static_columns}
	/>
</Block>
