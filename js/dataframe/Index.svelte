<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { SelectData } from "@gradio/utils";
	import { Gradio } from "@gradio/utils";
	import { Block } from "@gradio/atoms";
	import Table from "./shared/Table.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Datatype, DataframeValue } from "./shared/utils/utils";
	import type { DataframeProps, DataframeEvents } from "./types";
	import Image from "@gradio/image";

	let props = $props();

	let gradio = new Gradio<DataframeEvents, DataframeProps>(props);
</script>

<Block
	visible={gradio.shared.visible}
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={false}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	overflow_behavior="visible"
	bind:fullscreen={gradio.props.fullscreen}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on:clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	<Table
		root={gradio.shared.root}
		label={gradio.shared.label}
		show_label={gradio.shared.show_label}
		row_count={gradio.props.row_count}
		col_count={gradio.props.col_count}
		values={gradio.props.value.data}
		display_value={gradio.props.value.metadata?.display_value}
		styling={gradio.props.value.metadata?.styling}
		headers={gradio.props.value.headers}
		fullscreen={gradio.props.fullscreen}
		on:input={(e) => gradio.dispatch("input")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:edit={(e) => gradio.dispatch("edit", e.detail)}
		on:fullscreen={({ detail }) => {
			gradio.props.fullscreen = detail;
		}}
		on:change={(e) => {
			console.log("DataFrame change event:", e.detail);
			gradio.props.value.data = e.detail.data;
			gradio.props.value.headers = e.detail.headers;
			gradio.props.headers = e.detail.headers;
			gradio.dispatch("change");
		}}
		wrap={gradio.props.wrap}
		datatype={gradio.props.datatype}
		latex_delimiters={gradio.props.latex_delimiters}
		editable={gradio.shared.interactive}
		max_height={gradio.props.max_height}
		i18n={gradio.i18n}
		line_breaks={gradio.props.line_breaks}
		column_widths={gradio.props.column_widths}
		upload={(...args) => gradio.shared.client.upload(...args)}
		stream_handler={(...args) => gradio.shared.client.stream(...args)}
		buttons={gradio.props.buttons}
		max_chars={gradio.props.max_chars}
		show_row_numbers={gradio.props.show_row_numbers}
		show_search={gradio.props.show_search}
		pinned_columns={gradio.props.pinned_columns}
		components={{ image: Image }}
		static_columns={gradio.props.static_columns}
	/>
</Block>
