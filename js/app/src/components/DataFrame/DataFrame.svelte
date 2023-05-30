<script lang="ts">
	import { Table } from "@gradio/table";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { createEventDispatcher, afterUpdate } from "svelte";

	type Headers = Array<string>;
	type Data = Array<Array<string | number>>;
	type Datatype = "str" | "markdown" | "html" | "number" | "bool" | "date";

	export let headers: Headers = [];
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: { data: Data; headers: Headers } = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"]
	};
	let old_value: string = JSON.stringify(value);
	export let value_is_output: boolean = false;
	export let mode: "static" | "dynamic";
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let label: string | null = null;
	export let wrap: boolean;
	export let datatype: Datatype | Array<Datatype>;

	const dispatch = createEventDispatcher();

	export let loading_status: LoadingStatus;

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
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
</script>

<div id={elem_id} class={elem_classes.join(" ")} class:hide={!visible}>
	<StatusTracker {...loading_status} />
	<Table
		{label}
		{row_count}
		{col_count}
		values={value}
		{headers}
		on:change={({ detail }) => {
			value = detail;
		}}
		on:select
		editable={mode === "dynamic"}
		{wrap}
		{datatype}
	/>
</div>

<style>
	div {
		position: relative;
		overflow: hidden;
	}

	.hide {
		display: none;
	}
</style>
