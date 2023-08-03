<script lang="ts">
	import type { LoadingStatus } from "@gradio/statustracker/types";

	import StaticDataframe from "./static";
	import InteractiveDataframe from "./interactive";

	type Headers = string[];
	type Data = (string | number)[][];
	type Datatype = "str" | "markdown" | "html" | "number" | "bool" | "date";

	export let headers: Headers = [];
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value_is_output = false;
	export let mode: "static" | "dynamic";
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];
	export let label: string | null = null;
	export let wrap: boolean;
	export let datatype: Datatype | Datatype[];
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let value: { data: Data; headers: Headers } = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"]
	};
</script>

{#if mode === "static"}
	<StaticDataframe
		{headers}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{col_count}
		{row_count}
		{label}
		{wrap}
		{datatype}
		{scale}
		{min_width}
		{loading_status}
		on:change
		on:select
		on:input
	/>
{:else}
	<InteractiveDataframe
		{headers}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		bind:value_is_output
		{col_count}
		{row_count}
		{label}
		{wrap}
		{datatype}
		{scale}
		{min_width}
		{loading_status}
		on:change
		on:select
		on:input
	/>
{/if}
