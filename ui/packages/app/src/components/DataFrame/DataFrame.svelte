<script lang="ts">
	import { Table } from "@gradio/table";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { createEventDispatcher, tick } from "svelte";

	type Headers = Array<string>;
	type Data = Array<Array<string | number>>;
	type Datatype = "str" | "markdown" | "html" | "number" | "bool" | "date";

	export let headers: Headers = [];
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: { data: Data; headers: Headers } = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"]
	};
	export let mode: "static" | "dynamic";
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let label: string | null = null;
	export let wrap: boolean;
	export let datatype: Datatype | Array<Datatype>;

	const dispatch = createEventDispatcher();

	export let loading_status: LoadingStatus;

	async function handle_change(detail: {
		data: Array<Array<string | number>>;
		headers: Array<string>;
	}) {
		value = detail;
		await tick();
		dispatch("change", detail);
	}
</script>

<div id={elem_id} class="relative overflow-hidden" class:!hidden={!visible}>
	<StatusTracker {...loading_status} />
	<Table
		{label}
		{row_count}
		{col_count}
		values={value}
		{headers}
		on:change={({ detail }) => handle_change(detail)}
		editable={mode === "dynamic"}
		{wrap}
		{datatype}
	/>
</div>
