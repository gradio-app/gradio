<script lang="ts">
	import Table from "../shared/Table.svelte";
	import type { Datatype, DataframeValue } from "../shared/utils/utils";
	import type { I18nFormatter } from "@gradio/utils";

	export let i18n: I18nFormatter;
	const i18n_fn = (key: string | null | undefined): string => {
		if (!key) return "";
		return i18n[key] ?? key;
	};

	export let value: DataframeValue = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"],
		metadata: null
	};
	export let datatype: Datatype | Datatype[];
	export let editable = true;
	export let show_row_numbers = false;
	export let max_height = 500;
	export let show_search: "none" | "search" | "filter" = "none";
	export let show_copy_button = false;
	export let show_fullscreen_button = false;
	export let wrap = false;
	export let line_breaks = true;
	export let column_widths: string[] = [];
	export let max_chars: number | undefined = undefined;
	export let pinned_columns = 0;
	export let static_columns: (string | number)[] = [];
	export let fullscreen = false;
	export let label: string | null = null;
	export let show_label = true;
	export let latex_delimiters: any[] = [];
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];

	export let root = "";
	export let elem_id = "";
	export let elem_classes: string[] = [];
</script>

<div class="gradio-dataframe-standalone {elem_classes.join(' ')}" id={elem_id}>
	<Table
		values={value.data}
		{datatype}
		{editable}
		{show_row_numbers}
		{max_height}
		{show_search}
		{show_copy_button}
		{show_fullscreen_button}
		{wrap}
		{line_breaks}
		{column_widths}
		{max_chars}
		{pinned_columns}
		{static_columns}
		{fullscreen}
		{label}
		{show_label}
		{latex_delimiters}
		{col_count}
		{row_count}
		{root}
		i18n={i18n_fn}
		on:change
		on:blur
		on:keydown
		on:input
		on:select
		on:fullscreen
		upload={async () => null}
		stream_handler={() => new EventSource("about:blank")}
	/>
</div>
