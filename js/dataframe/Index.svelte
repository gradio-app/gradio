<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { SharedProps } from "@gradio/utils";
	import { Gradio } from "@gradio/utils";

	import type { DataframeProps, DataframeEvents } from "./types";
	import { dequal } from "dequal";
	import { onMount } from "svelte";
	import DF from "@gradio/dataframe-interim";
	import "@gradio/dataframe-interim/css";

	let prev_data: any = null;

	let changed = false;

	class DataframeGradio extends Gradio<DataframeEvents, DataframeProps> {
		async set_data(data: Partial<DataframeProps & SharedProps>): Promise<void> {
			if (data.value) {
				changed = true;
			}

			super.set_data(data);
			if (data.value && dequal(data.value, JSON.parse(prev_data)) === false) {
				// this.dispatch("change");
				prev_data = JSON.stringify(data.value);
			}
		}
	}

	let props = $props();

	let gradio = new DataframeGradio(props);
	let el: HTMLDivElement;
	let Component: typeof DF | null = null;
	onMount(() => {
		Component = new DF({
			target: el,
			props: {
				elem_id: gradio.shared.elem_id,
				elem_classes: gradio.shared.elem_classes,
				visible: gradio.shared.visible,
				value: gradio.props.value,

				col_count: gradio.props.col_count,
				row_count: gradio.props.row_count,
				label: gradio.shared.label,
				show_label: gradio.shared.show_label,
				wrap: gradio.props.wrap,
				datatype: gradio.props.datatype,
				scale: gradio.shared.scale,
				min_width: gradio.shared.min_width,
				root: gradio.shared.root,
				line_breaks: gradio.props.line_breaks,
				column_widths: gradio.props.column_widths,
				gradio: compat_gradio,
				latex_delimiters: gradio.props.latex_delimiters,
				max_height: gradio.props.max_height,
				loading_status: gradio.shared.loading_status,
				interactive: gradio.shared.interactive,
				buttons: gradio.props.buttons,
				max_chars: gradio.props.max_chars,
				show_row_numbers: gradio.props.show_row_numbers,
				show_search: gradio.props.show_search,
				pinned_columns: gradio.props.pinned_columns,
				static_columns: gradio.props.static_columns,
				fullscreen: gradio.props.fullscreen
			}
		});
	});

	const compat_gradio = {
		i18n: gradio.i18n,
		client: gradio.shared.client,
		dispatch(name: keyof DataframeEvents, detail?: any) {
			if (name === "input" && changed) {
				changed = false;
				return;
			}
			gradio.dispatch(name, detail);
		},
		autoscroll: gradio.shared.autoscroll
	};
	$effect(() => {
		if (Component) {
			Component.$set({
				elem_id: gradio.shared.elem_id,
				elem_classes: gradio.shared.elem_classes,
				visible: gradio.shared.visible,
				value: gradio.props.value,

				col_count: gradio.props.col_count,
				row_count: gradio.props.row_count,
				label: gradio.shared.label,
				show_label: gradio.shared.show_label,
				wrap: gradio.props.wrap,
				datatype: gradio.props.datatype,
				scale: gradio.shared.scale,
				min_width: gradio.shared.min_width,
				root: gradio.shared.root,
				line_breaks: gradio.props.line_breaks,
				column_widths: gradio.props.column_widths,
				gradio: compat_gradio,
				latex_delimiters: gradio.props.latex_delimiters,
				max_height: gradio.props.max_height,
				loading_status: gradio.shared.loading_status,
				interactive: gradio.shared.interactive,
				buttons: gradio.props.buttons,
				max_chars: gradio.props.max_chars,
				show_row_numbers: gradio.props.show_row_numbers,
				show_search: gradio.props.show_search,
				pinned_columns: gradio.props.pinned_columns,
				static_columns: gradio.props.static_columns,
				fullscreen: gradio.props.fullscreen
			});
		}
	});
</script>

<div bind:this={el} />
