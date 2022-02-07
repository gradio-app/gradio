<script lang="ts">
	import Upload from "../../utils/Upload.svelte";
	import Chart from "../../utils/Chart.svelte";

	interface Data {
		data: Array<Array<number>> | string;
		headers?: Array<string>;
	}

	export let value: null | Data;
	export let setValue: (val: Data) => Data;
	export let theme: string;
	export let y: Array<string>;
	export let x: string;
	let _value: string | null;

	function data_uri_to_blob(data_uri: string) {
		var byte_str = atob(data_uri.split(",")[1]);
		var mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];

		var ab = new ArrayBuffer(byte_str.length);
		var ia = new Uint8Array(ab);

		for (var i = 0; i < byte_str.length; i++) {
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
		console.log(x, y);
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

	interface FileData {
		name: string;
		size: number;
		data: string;
		is_example: false;
	}

	function handle_load(v: string | FileData | (string | FileData)[] | null) {
		setValue({ data: v as string });
		return v;
	}
</script>

{#if _value}
	<Chart
		value={_value}
		{y}
		{x}
		on:process={({ detail: { x, y } }) => setValue(make_dict(x, y))}
	/>
{/if}
{#if !value}
	<Upload
		filetype="text/csv"
		load={handle_load}
		include_file_metadata={false}
		{theme}
	>
		Drop CSV Here
		<br />- or -<br />
		Click to Upload
	</Upload>
{/if}
