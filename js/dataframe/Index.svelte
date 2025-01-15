<script context="module" lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { afterUpdate, tick } from "svelte";
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
	let old_value = "";
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
	}>;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let max_height: number | undefined = undefined;

	export let loading_status: LoadingStatus;
	export let interactive: boolean;

	let _headers: Headers;
	let display_value: string[][] | null;
	let styling: string[][] | null;
	let values: (string | number)[][];
	async function handle_change(data?: {
		data: Data;
		headers: Headers;
		metadata: Metadata;
	}): Promise<void> {
		let _data = data || value;

		_headers = [...(_data.headers || headers)];
		values = _data.data ? [..._data.data] : [];
		display_value = _data?.metadata?.display_value
			? [..._data?.metadata?.display_value]
			: null;
		styling =
			!interactive && _data?.metadata?.styling
				? [..._data?.metadata?.styling]
				: null;
		await tick();

		gradio.dispatch("change");
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}

	handle_change();

	afterUpdate(() => {
		value_is_output = false;
	});

	$: {
		if (old_value && JSON.stringify(value) !== old_value) {
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

	async function handle_value_change(data: {
		data: Data;
		headers: Headers;
		metadata: Metadata;
	}): Promise<void> {
		if (JSON.stringify(data) !== old_value) {
			value = { ...data };
			old_value = JSON.stringify(value);
			handle_change(data);
		}
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
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<Table
		{root}
		{label}
		{show_label}
		{row_count}
		{col_count}
		{values}
		{display_value}
		{styling}
		headers={_headers}
		on:change={(e) => handle_value_change(e.detail)}
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
	/>
</Block>
