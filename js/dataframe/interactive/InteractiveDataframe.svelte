<script lang="ts">
	import { Block } from "@gradio/atoms";
	import Table from "../shared";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";
	import { createEventDispatcher, afterUpdate } from "svelte";

	type Headers = string[];
	type Data = (string | number)[][];
	type Datatype = "str" | "markdown" | "html" | "number" | "bool" | "date";

	export let headers: Headers = [];
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: { data: Data; headers: Headers } = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"]
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

	const dispatch = createEventDispatcher();

	export let loading_status: LoadingStatus;

	function handle_change(): void {
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
		editable
		{wrap}
		{datatype}
	/>
</Block>
