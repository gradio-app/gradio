<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import Chart from "../shared";
	import { UploadText } from "@gradio/atoms";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";

	import { Chart as ChartIcon } from "@gradio/icons";

	function format_value(val: StaticData): any {
		return val.data.map((r) =>
			r.reduce((acc, next, i) => ({ ...acc, [val.headers[i]]: next }), {})
		);
	}

	interface StaticData {
		data: number[][];
		headers: string[];
	}
	interface Data {
		data: number[][] | string;
		headers?: string[];
	}

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | Data;
	export let y: string[];
	export let x: string;
	export let label: string;
	export let show_label: boolean;
	export let colors: string[];
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: undefined;
		clear: undefined;
	}>;

	let _value: string | null;

	function data_uri_to_blob(data_uri: string): Blob {
		const byte_str = atob(data_uri.split(",")[1]);
		const mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];

		const ab = new ArrayBuffer(byte_str.length);
		const ia = new Uint8Array(ab);

		for (let i = 0; i < byte_str.length; i++) {
			ia[i] = byte_str.charCodeAt(i);
		}

		return new Blob([ab], { type: mime_str });
	}

	function blob_to_string(blob: Blob): void {
		const reader = new FileReader();

		reader.addEventListener("loadend", (e) => {
			//@ts-ignore
			_value = e.srcElement.result;
		});

		reader.readAsText(blob);
	}

	function dict_to_string(dict: Data): void {
		if (dict.headers) _value = dict.headers.join(",");
		const data = dict.data as number[][];
		data.forEach((_x: unknown[]) => {
			_value = _value + "\n";
			_value = _value + _x.join(",");
		});
	}

	$: {
		if (value && value.data && typeof value.data === "string") {
			if (!value) _value = null;
			else blob_to_string(data_uri_to_blob(value.data));
		} else if (value && value.data && typeof value.data != "string") {
			if (!value) _value = null;
			dict_to_string(value);
		}
	}

	interface XRow {
		name: string;
		values: number[];
	}

	interface YRow {
		name: string;
		values: { x: number; y: number }[];
	}

	function make_dict(_x: XRow, _y: YRow[]): Data {
		const headers = [];
		const data = [];

		headers.push(_x.name);
		_y.forEach(({ name }) => headers.push(name));

		for (let i = 0; i < _x.values.length; i++) {
			let _data = [];
			_data.push(_x.values[i]);
			_y.forEach(({ values }) => _data.push(values[i].y));

			data.push(_data);
		}
		return { headers, data };
	}

	function handle_load(
		v: string | FileData | (string | FileData)[] | null
	): string | FileData | (string | FileData)[] | null {
		value = { data: v as string };
		return v;
	}

	function handle_clear({ detail }: CustomEvent<FileData | null>): void {
		value = null;
		gradio.dispatch("change");
		gradio.dispatch("clear");
	}

	$: _value = value == null ? null : _value;

	$: value, gradio.dispatch("change");
</script>

<Block
	{visible}
	variant={!_value ? "dashed" : "solid"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<BlockLabel {show_label} Icon={ChartIcon} label={label || "TimeSeries"} />
	<StatusTracker {...loading_status} />

	{#if _value}
		<div class="chart">
			<ModifyUpload on:clear={handle_clear} />
			<Chart
				value={_value}
				{y}
				{x}
				on:process={({ detail: { x, y } }) => (value = make_dict(x, y))}
				{colors}
			/>
		</div>
	{:else if value === undefined || value === null}
		<Upload
			filetype="text/csv"
			on:load={({ detail }) => handle_load(detail)}
			include_file_metadata={false}
		>
			<UploadText type="csv" />
		</Upload>
	{/if}
</Block>

<style>
	.chart {
		display: flex;
		display: relative;
		justify-content: center;
		align-items: center;
		background: var(--background-fill-primary);
		width: var(--size-full);
		height: var(--size-64);
	}
</style>
