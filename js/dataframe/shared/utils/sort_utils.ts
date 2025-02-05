import type { Headers } from "../types";

export type SortDirection = "asc" | "des";

export function get_sort_status(
	name: string,
	sort_by: number | undefined,
	direction: SortDirection | undefined,
	headers: Headers
): "none" | "ascending" | "descending" {
	if (typeof sort_by !== "number") return "none";
	if (sort_by < 0 || sort_by >= headers.length) return "none";
	if (headers[sort_by] === name) {
		if (direction === "asc") return "ascending";
		if (direction === "des") return "descending";
	}
	return "none";
}

export function sort_data(
	data: { id: string; value: string | number }[][],
	sort_by: number | undefined,
	sort_direction: SortDirection | undefined
): number[] {
	if (!data || !data.length || !data[0]) {
		return [];
	}

	if (
		typeof sort_by === "number" &&
		sort_direction &&
		sort_by >= 0 &&
		sort_by < data[0].length
	) {
		const row_indices = [...Array(data.length)].map((_, i) => i);
		row_indices.sort((row_a_idx, row_b_idx) => {
			const row_a = data[row_a_idx];
			const row_b = data[row_b_idx];
			if (
				!row_a ||
				!row_b ||
				sort_by >= row_a.length ||
				sort_by >= row_b.length
			)
				return 0;

			const val_a = row_a[sort_by].value;
			const val_b = row_b[sort_by].value;
			const comparison = val_a < val_b ? -1 : val_a > val_b ? 1 : 0;
			return sort_direction === "asc" ? comparison : -comparison;
		});
		return row_indices;
	}
	return [...Array(data.length)].map((_, i) => i);
}
