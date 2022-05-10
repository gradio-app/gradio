<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Upload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Chart } from "@gradio/chart";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";

	import { Chart as ChartIcon } from "@gradio/icons";

	function format_value(val: StaticData) {
		return val.data.map((r) =>
			r.reduce((acc, next, i) => ({ ...acc, [val.headers[i]]: next }), {})
		);
	}

	const dispatch = createEventDispatcher<{ change: undefined }>();

	interface StaticData {
		data: Array<Array<number>>;
		headers: Array<string>;
	}
	interface Data {
		data: Array<Array<number>> | string;
		headers?: Array<string>;
	}

	export let value: null | Data;
	export let default_value: null | Data;
	export let style: string = "";
	export let y: Array<string>;
	export let x: string;
	export let mode: "static" | "dynamic";
	export let label: string;
	export let show_label: boolean;
	export let colors: Array<string>;

	export let loading_status: LoadingStatus;

	let _value: string | null;

	function data_uri_to_blob(data_uri: string) {
		const byte_str = atob(data_uri.split(",")[1]);
		const mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];

		const ab = new ArrayBuffer(byte_str.length);
		const ia = new Uint8Array(ab);

		for (let i = 0; i < byte_str.length; i++) {
			ia[i] = byte_str.charCodeAt(i);
		}

		return new Blob([ab], { type: mime_str });
	}

	function blob_to_string(blob: Blob) {
		const reader = new FileReader();

		reader.addEventListener("loadend", (e) => {
			//@ts-ignore
			_value = e.srcElement.result;
		});

		reader.readAsText(blob);
	}

	$: {
		if (value && value.data && typeof value.data === "string") {
			if (!value) _value = null;
			else blob_to_string(data_uri_to_blob(value.data));
		}
	}

	interface XRow {
		name: string;
		values: Array<number>;
	}

	interface YRow {
		name: string;
		values: Array<{ x: number; y: number }>;
	}

	function make_dict(x: XRow, y: Array<YRow>): Data {
		const headers = [];
		const data = [];

		headers.push(x.name);
		y.forEach(({ name }) => headers.push(name));

		for (let i = 0; i < x.values.length; i++) {
			let _data = [];
			_data.push(x.values[i]);
			y.forEach(({ values }) => _data.push(values[i].y));

			data.push(_data);
		}
		return { headers, data };
	}

	function handle_load(v: string | FileData | (string | FileData)[] | null) {
		value = { data: v as string };
		// setValue({ data: v as string });
		return v;
	}

	$: _value = value == null ? null : _value;
	$: static_data =
		mode === "static" && value && format_value(value as StaticData);

	$: value, dispatch("change");

	if (default_value) value = default_value;
</script>

<Block
	variant={mode === "dynamic" && !_value ? "dashed" : "solid"}
	color={"grey"}
	padding={false}
>
	<BlockLabel {show_label} Icon={ChartIcon} label={label || "TimeSeries"} />
	<StatusTracker {...loading_status} />

	{#if mode === "static"}
		{#if static_data}
			<Chart value={static_data} {colors} />
		{:else}
			<div class="min-h-[16rem] flex justify-center items-center">
				<div class="h-10 dark:text-white opacity-50"><ChartIcon /></div>
			</div>
		{/if}
	{:else if _value}
		<Chart
			value={_value}
			{y}
			{x}
			on:process={({ detail: { x, y } }) => (value = make_dict(x, y))}
			{colors}
		/>
	{:else if value === undefined}
		<div class="min-h-[8rem]">
			<Upload
				filetype="text/csv"
				on:load={({ detail }) => handle_load(detail)}
				include_file_metadata={false}
				{style}
			>
				{$_("interface.drop_csv")}
				<br />- {$_("or")} -<br />
				{$_("interface.click_to_upload")}
			</Upload>
		</div>
	{/if}
</Block>
