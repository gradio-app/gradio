import type { SelectData } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
import type { DataframeValue, Datatype, EditData } from "./shared/utils/utils";

export interface DataframeEvents {
	change: DataframeValue;
	input: never;
	select: SelectData;
	edit: EditData;
	clear_status: LoadingStatus;
}

export interface DataframeProps {
	value: DataframeValue;
	col_count: [number, "fixed" | "dynamic"];
	row_count: [number, "fixed" | "dynamic"];
	wrap: boolean;
	datatype: Datatype | Datatype[];
	line_breaks: boolean;
	column_widths: string[];
	latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	max_height: number;
	buttons: string[] | null;
	max_chars: number | undefined;
	show_row_numbers: boolean;
	show_search: "none" | "search" | "filter";
	pinned_columns: number;
	static_columns: (string | number)[];
	fullscreen: boolean;
}
