import type { Headers } from "../types";
import { sort_table_data } from "./table_utils";

export type SortDirection = "asc" | "desc";

export function get_sort_status(
	name: string,
	sort_columns: { col: number; direction: SortDirection }[],
	headers: Headers
): "none" | "asc" | "desc" {
	if (!sort_columns.length) return "none";

	const sort_item = sort_columns.find((item) => {
		const col = item.col;
		if (col < 0 || col >= headers.length) return false;
		return headers[col] === name;
	});

	if (!sort_item) return "none";
	return sort_item.direction;
}

export function sort_data(
	data: { id: string; value: string | number }[][],
	sort_columns: { col: number; direction: SortDirection }[]
): number[] {
	if (!data || !data.length || !data[0]) {
		return [];
	}

	if (sort_columns.length > 0) {
		const row_indices = [...Array(data.length)].map((_, i) => i);
		row_indices.sort((row_a_idx, row_b_idx) => {
			const row_a = data[row_a_idx];
			const row_b = data[row_b_idx];

			for (const { col: sort_by, direction } of sort_columns) {
				if (
					!row_a ||
					!row_b ||
					sort_by < 0 ||
					sort_by >= row_a.length ||
					sort_by >= row_b.length ||
					!row_a[sort_by] ||
					!row_b[sort_by]
				) {
					continue;
				}

				const val_a = row_a[sort_by].value;
				const val_b = row_b[sort_by].value;
				const comparison = val_a < val_b ? -1 : val_a > val_b ? 1 : 0;

				if (comparison !== 0) {
					return direction === "asc" ? comparison : -comparison;
				}
			}

			return 0;
		});
		return row_indices;
	}
	return [...Array(data.length)].map((_, i) => i);
}

export function sort_data_and_preserve_selection(
	data: { id: string; value: string | number }[][],
	display_value: string[][] | null,
	styling: string[][] | null,
	sort_columns: { col: number; direction: SortDirection }[],
	selected: [number, number] | false,
	get_current_indices: (
		id: string,
		data: { id: string; value: string | number }[][]
	) => [number, number]
): { data: typeof data; selected: [number, number] | false } {
	let id = null;
	if (selected && selected[0] in data && selected[1] in data[selected[0]]) {
		id = data[selected[0]][selected[1]].id;
	}

	sort_table_data(data, display_value, styling, sort_columns);

	let new_selected = selected;
	if (id) {
		const [i, j] = get_current_indices(id, data);
		new_selected = [i, j];
	}

	return { data, selected: new_selected };
}
