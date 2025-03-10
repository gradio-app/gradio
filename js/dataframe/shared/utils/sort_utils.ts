import type { Headers } from "../types";

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

			// Compare each sort column in order until a difference is found
			for (const { col: sort_by, direction } of sort_columns) {
				if (
					!row_a ||
					!row_b ||
					sort_by >= row_a.length ||
					sort_by >= row_b.length
				) {
					continue;
				}

				const val_a = row_a[sort_by].value;
				const val_b = row_b[sort_by].value;
				const comparison = val_a < val_b ? -1 : val_a > val_b ? 1 : 0;

				// If values are different, return the comparison result
				if (comparison !== 0) {
					return direction === "asc" ? comparison : -comparison;
				}
				// If values are equal, continue to the next sort column
			}

			// If all sort columns have equal values, maintain original order
			return 0;
		});
		return row_indices;
	}
	return [...Array(data.length)].map((_, i) => i);
}
