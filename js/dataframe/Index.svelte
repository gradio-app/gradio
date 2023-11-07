<script context="module" lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { afterUpdate } from "svelte";
	import type { Gradio, SelectData } from "@gradio/utils";
	import { Block } from "@gradio/atoms";
	import Table from "./shared/Table.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Headers, Data, Metadata, Datatype } from "./shared/utils";
	export let headers: Headers = [];
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: { data: Data; headers: Headers; metadata: Metadata } = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"],
		metadata: null
	};
	let old_value: string = JSON.stringify(value);
	export let value_is_output = false;
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let label: string | null = null;
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
	}>;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let height: number | undefined = undefined;

	export let loading_status: LoadingStatus;
	export let interactive: boolean;

	function handle_change(): void {
		gradio.dispatch("change");
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: {
		if (JSON.stringify(value) !== old_value) {
			old_value = JSON.stringify(value);
			handle_change();
		}
	}
	if (
		(Array.isArray(value) && value?.[0]?.length === 0) ||
		value.data?.[0]?.length === 0
	) {
		value = {
			data: [Array(col_count?.[0] || 3).fill("")],
			headers: Array(col_count?.[0] || 3)
				.fill("")
				.map((_, i) => `${i + 1}`),
			metadata: null
		};
	}
</script>

<Block
	{visible}
	padding={false}
	{elem_id}
	{elem_classes}
	container={false}
	{scale}
	{min_width}
	allow_overflow={false}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>
	<Table
		{root}
		{label}
		{row_count}
		{col_count}
		{value}
		{headers}
		on:change={interactive ? (e) => (value = e.detail) : () => {}}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		{wrap}
		{datatype}
		{latex_delimiters}
		editable={interactive}
		{height}
		i18n={gradio.i18n}
		{line_breaks}
		{column_widths}
	/>
</Block>
