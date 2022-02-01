<script>
	import Upload from "../../utils/Upload.svelte";
	import Chart from "../../utils/Chart.svelte";

	export let value, setValue, theme, y, x;
	let _value;

	function data_uri_to_blob(data_uri) {
		var byte_str = atob(data_uri.split(",")[1]);
		var mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];

		var ab = new ArrayBuffer(byte_str.length);
		var ia = new Uint8Array(ab);

		for (var i = 0; i < byte_str.length; i++) {
			ia[i] = byte_str.charCodeAt(i);
		}

		return new Blob([ab], { type: mime_str });
	}

	function blob_to_string(blb) {
		const reader = new FileReader();

		reader.addEventListener("loadend", (e) => {
			_value = e.srcElement.result;
		});

		reader.readAsText(blb);
	}

	$: {
		if (value && value.data && typeof value.data === "string") {
			if (!value) _value = null;
			else blob_to_string(data_uri_to_blob(value.data));
		}
	}

	function make_dict(x, y) {
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
</script>

{#if _value}
	<Chart value={_value} {y} {x} on:process={({ detail: { x, y } }) => setValue(make_dict(x, y))} />
{/if}
{#if !value}
	<Upload
		filetype="text/csv"
		load={(v) => setValue({ data: v })}
		include_file_metadata={false}
		{theme}
	>
		Drop CSV Here
		<br />- or -<br />
		Click to Upload
	</Upload>
{/if}
