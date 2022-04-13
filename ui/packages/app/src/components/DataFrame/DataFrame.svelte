<script lang="ts">
	import { Table } from "@gradio/table";
	import { createEventDispatcher, tick } from "svelte";

	type Headers = Array<string>;
	type Data = Array<Array<string | number>>;

	export let headers: Headers = [];
	export let value: Data | { data: Data; headers: Headers } = [["", "", ""]];
	export let default_value: Array<Array<string | number>> = [["", "", ""]];

	export let style: string = "";
	export let is_static: boolean;

	let values = value;

	if (default_value) value = default_value;

	$: {
		if (!Array.isArray(value)) {
			if (Array.isArray(value.headers)) headers = value.headers;
			value = value.data;
		} else {
			value = value;
		}
	}

	const dispatch = createEventDispatcher();

	async function handle_change({ detail }) {
		value = detail;
		await tick();

		dispatch("change", detail);
	}
</script>

<Table
	values={value}
	{headers}
	{style}
	on:change={handle_change}
	editable={!is_static}
/>
