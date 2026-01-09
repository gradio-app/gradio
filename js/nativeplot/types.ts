import type { Gradio, SelectData, CustomButton } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";

export interface PlotData {
	columns: string[];
	data: [string | number][];
	datatypes: Record<string, "quantitative" | "temporal" | "nominal">;
	mark: "line" | "point" | "bar";
}

export interface NativePlotProps {
	value: PlotData | null;
	x: string;
	y: string;
	color: string | null;
	title: string | null;
	x_title: string | null;
	y_title: string | null;
	color_title: string | null;
	x_bin: string | number | null;
	y_aggregate: "sum" | "mean" | "median" | "min" | "max" | undefined;
	color_map: Record<string, string> | null;
	colors_in_legend: string[] | null;
	x_lim: [number | null, number | null] | null;
	y_lim: [number | null, number | null] | null;
	x_label_angle: number | null;
	y_label_angle: number | null;
	x_axis_labels_visible: boolean;
	caption: string | null;
	sort: "x" | "y" | "-x" | "-y" | string[] | null;
	tooltip: "axis" | "none" | "all" | string[];
	buttons: (string | CustomButton)[] | null;
	_selectable: boolean;
	label: string;
	elem_id: string;
	elem_classes: string[];
	visible: boolean | "hidden";
	show_label: boolean;
	scale: number | null;
	min_width: number | undefined;
	loading_status: LoadingStatus | undefined;
	height: number | undefined;
}

export interface NativePlotEvents {
	select: SelectData;
	double_click: undefined;
	clear_status: LoadingStatus;
	custom_button_click: { id: number };
}
