<script module lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { tick } from "svelte";
	import Table from "./shared/Table.svelte";
	import StatusTracker from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";
	import { Gradio } from "@gradio/utils";
	import type { DataframeProps, DataframeEvents } from "./types";
	import { dequal } from "dequal";

	let _props = $props();
	const gradio = new Gradio<DataframeEvents, DataframeProps>(_props);

	let fullscreen = $state(gradio.props.fullscreen ?? false);
	let rendered_value = $state(structuredClone(gradio.props.value) ?? null);

	$effect(() => {
		const next_value = gradio.props.value;
		if (!dequal(next_value, rendered_value)) {
			rendered_value = structuredClone(next_value) ?? null;
		}
	});

	// align datatype array to current value headers using the original
	// config-time header→datatype mapping.
	// when columns are hidden or reordered, positional indices shift but
	// the datatype prop doesn't update, the map keeps them synced
	let aligned_datatype = $derived.by(() => {
		const dt = gradio.props.datatype;
		if (!Array.isArray(dt)) return dt;

		const config_headers: string[] | undefined = (gradio.props as any).headers;
		const current_headers = gradio.props.value?.headers;
		if (!config_headers || !current_headers) return dt;

		const map = new Map<string, string>();
		for (let i = 0; i < Math.min(config_headers.length, dt.length); i++) {
			map.set(config_headers[i], dt[i]);
		}
		return current_headers.map(
			(h: string, i: number) => map.get(h) ?? dt[i] ?? "str"
		);
	});

	let old_value = $state(
		gradio.props.value ? JSON.stringify(gradio.props.value) : null
	);

	function handle_change(detail: any): void {
		gradio.props.value = detail;
		const serialized = JSON.stringify(detail);
		if (serialized !== old_value) {
			old_value = serialized;
			gradio.dispatch("change", detail);
		}
	}

	function handle_input(): void {
		gradio.dispatch("input");
	}

	function handle_select(detail: any): void {
		gradio.dispatch("select", detail);
	}

	function handle_edit(detail: any): void {
		gradio.dispatch("edit", detail);
	}

	$effect(() => {
		const v = gradio.props.value;
		if (v) {
			const serialized = JSON.stringify(v);
			if (serialized !== old_value) {
				old_value = serialized;
				gradio.dispatch("change", v);
			}
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	padding={false}
	container={false}
	{fullscreen}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
	/>
	<Table
		headers={rendered_value?.headers ?? []}
		values={rendered_value?.data ?? []}
		display_value={rendered_value?.metadata?.display_value ?? null}
		styling={rendered_value?.metadata?.styling ?? null}
		col_count={gradio.props.col_count}
		row_count={gradio.props.row_count}
		label={gradio.shared.label}
		show_label={gradio.shared.show_label}
		wrap={gradio.props.wrap}
		datatype={aligned_datatype}
		latex_delimiters={gradio.props.latex_delimiters}
		max_height={gradio.props.max_height}
		editable={gradio.shared.interactive ?? true}
		line_breaks={gradio.props.line_breaks}
		column_widths={gradio.props.column_widths ?? []}
		root={gradio.shared.root}
		i18n={gradio.i18n}
		upload={gradio.shared.client?.upload}
		stream_handler={gradio.shared.client?.stream}
		buttons={gradio.props.buttons}
		max_chars={gradio.props.max_chars}
		show_row_numbers={gradio.props.show_row_numbers}
		show_search={gradio.props.show_search}
		pinned_columns={gradio.props.pinned_columns}
		static_columns={gradio.props.static_columns ?? []}
		{fullscreen}
		onfullscreen={() => {
			fullscreen = !fullscreen;
		}}
		onchange={handle_change}
		oninput={handle_input}
		onselect={handle_select}
		onedit={handle_edit}
	/>
</Block>
