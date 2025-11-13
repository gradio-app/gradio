<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseDataFrame } from "./shared/Table.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	// import DF from "@gradio/dataframe-interim";
	// import "@gradio/dataframe-interim/css";
	// import type { Gradio, SelectData } from "@gradio/utils";
	// import { Block } from "@gradio/atoms";
	// import Table from "./shared/Table.svelte";
	// import { StatusTracker } from "@gradio/statustracker";
	// import type { LoadingStatus } from "@gradio/statustracker";
	// import type { Datatype, DataframeValue } from "./shared/utils/utils";

	// import Image from "@gradio/image";
	// import { onMount } from "svelte";

	// export let elem_id = "";
	// export let elem_classes: string[] = [];
	// export let visible: boolean | "hidden" = true;
	// export let value: DataframeValue = {
	// 	data: [["", "", ""]],
	// 	headers: ["1", "2", "3"],
	// 	metadata: null,
	// };
	// export let value_is_output = false;
	// export let col_count: [number, "fixed" | "dynamic"];
	// export let row_count: [number, "fixed" | "dynamic"];
	// export let label: string | null = null;
	// export let show_label = true;
	// export let wrap: boolean;
	// export let datatype: Datatype | Datatype[];
	// export let scale: number | null = null;
	// export let min_width: number | undefined = undefined;
	// export let root: string;

	// export let line_breaks = true;
	// export let column_widths: string[] = [];
	// export let gradio: Gradio<{
	// 	change: never;
	// 	select: SelectData;
	// 	input: never;
	// 	clear_status: LoadingStatus;
	// 	search: string | null;
	// 	edit: SelectData;
	// }>;
	// export let latex_delimiters: {
	// 	left: string;
	// 	right: string;
	// 	display: boolean;
	// }[];
	// export let max_height: number | undefined = undefined;
	// export let loading_status: LoadingStatus;
	// export let interactive: boolean;
	// export let buttons: string[] | null = null;
	// export let max_chars: number | undefined = undefined;
	// export let show_row_numbers = false;
	// export let show_search: "none" | "search" | "filter" = "none";
	// export let pinned_columns = 0;
	// export let static_columns: (string | number)[] = [];
	// export let fullscreen = false;

	import type { SelectData, SharedProps } from "@gradio/utils";
	import { Gradio } from "@gradio/utils";
	import { Block } from "@gradio/atoms";
	import Table from "./shared/Table.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Datatype, DataframeValue } from "./shared/utils/utils";
	import type { DataframeProps, DataframeEvents } from "./types";
	import Image from "@gradio/image";
	import { dequal } from "dequal";
	import { onMount } from "svelte";
	import DF from "@gradio/dataframe-interim";
	import "@gradio/dataframe-interim/css";

	let prev_data: any = null;

	class DataframeGradio extends Gradio<DataframeEvents, DataframeProps> {
		async set_data(data: Partial<DataframeProps & SharedProps>): Promise<void> {
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
				fullscreen: gradio.props.fullscreen,
			},
		});
	});

	// $inspect(gradio.props, "gradio.props");
	// $inspect(gradio.shared, "gradio.shared");
	const compat_gradio = {
		i18n: gradio.i18n,
		client: gradio.shared.client,
		dispatch(name: keyof DataframeEvents, detail?: any) {
			console.log("Dispatching", name, detail);
			gradio.dispatch(name, detail);
		},
		autoscroll: gradio.shared.autoscroll,
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
				fullscreen: gradio.props.fullscreen,
			});
		}
	});
</script>

<div bind:this={el} />
