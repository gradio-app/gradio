import { sort_data } from "./utils/sort_utils";
import type { SortDirection } from "./utils/sort_utils";

export function sort_table_data(
	data: { id: string; value: string | number }[][],
	display_value: string[][] | null,
	styling: string[][] | null,
	col: number,
	dir: SortDirection,
	show_row_numbers = false
): void {
	const indices = sort_data(data, col, dir);

	const new_data = indices.map((i: number) => data[i]);
	data.splice(0, data.length, ...new_data);

	if (display_value) {
		const new_display = indices.map((i: number) => display_value[i]);
		display_value.splice(0, display_value.length, ...new_display);
	}

	if (styling) {
		const new_styling = indices.map((i: number) => styling[i]);
		styling.splice(0, styling.length, ...new_styling);
	}
}
