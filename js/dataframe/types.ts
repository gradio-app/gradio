import type { SelectData } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
import type { Datatype, DataframeValue } from "./shared/utils/utils";

export interface DataframeEvents {
	change: never;
	select: SelectData;
	input: never;
	clear_status: LoadingStatus;
	search: string | null;
	edit: SelectData;
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
	headers: string[] | null;
	max_height: number | undefined;
	buttons: string[] | null;
	max_chars: number | undefined;
	show_row_numbers: boolean;
	show_search: "none" | "search" | "filter";
	pinned_columns: number;
	static_columns: (string | number)[];
	fullscreen: boolean;
}

// export let value: DataframeValue = {
// 		data: [["", "", ""]],
// 		headers: ["1", "2", "3"],
// 		metadata: null,
// 	};

// 	export let col_count: [number, "fixed" | "dynamic"];
// 	export let row_count: [number, "fixed" | "dynamic"];

// 	export let wrap: boolean;
// 	export let datatype: Datatype | Datatype[];

// 	export let line_breaks = true;
// 	export let column_widths: string[] = [];

// 	export let latex_delimiters: {
// 		left: string;
// 		right: string;
// 		display: boolean;
// 	}[];
// 	export let max_height: number | undefined = undefined;
// 	export let buttons: string[] | null = null;
// 	export let max_chars: number | undefined = undefined;
// 	export let show_row_numbers = false;
// 	export let show_search: "none" | "search" | "filter" = "none";
// 	export let pinned_columns = 0;
// 	export let static_columns: (string | number)[] = [];
// 	export let fullscreen = false;
