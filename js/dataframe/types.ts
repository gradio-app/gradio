import type { SelectData } from "@gradio/utils";

export interface DataframeValue {
	data: (string | number | boolean)[][];
	headers: string[];
	metadata?: any;
}

export interface DataframeProps {
	value: DataframeValue;
	col_count: [number, "fixed" | "dynamic"];
	row_count: [number, "fixed" | "dynamic"];
	wrap: boolean;
	datatype: string | string[];
	line_breaks: boolean;
	column_widths: string[];
	latex_delimiters: { left: string; right: string; display: boolean }[];
	max_height: number | string;
	buttons: string[] | null;
	max_chars: number | undefined;
	show_row_numbers: boolean;
	show_search: "none" | "search" | "filter";
	pinned_columns: number;
	static_columns: (string | number)[];
	fullscreen: boolean;
}

export interface DataframeEvents {
	change: DataframeValue;
	input: DataframeValue;
	select: SelectData;
	edit: {
		index: [number, number];
		previous_value: string | number | boolean;
		value: string | number | boolean;
	};
}

