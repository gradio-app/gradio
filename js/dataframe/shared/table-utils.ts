export type SortDirection = "asc" | "des";

type TableCell = {
	id: string;
	value: string | number;
};

const compare_values = (a: string | number, b: string | number): number => {
	const val_a = Number(a);
	const val_b = Number(b);
	return !isNaN(val_a) && !isNaN(val_b)
		? val_a - val_b
		: String(a).localeCompare(String(b));
};

export const sort_table_data = (
	data: TableCell[][],
	display_value: string[][] | null,
	styling: string[][] | null,
	col: number,
	dir: SortDirection
): void => {
	const indices = [...Array(data.length).keys()];
	const compare =
		col === -1
			? (i: number, j: number) => (dir === "asc" ? i - j : j - i)
			: (i: number, j: number) => {
					const result = compare_values(data[i][col].value, data[j][col].value);
					return dir === "asc" ? result : -result;
				};

	indices.sort(compare);

	const temp_data = [...data];
	const temp_display = display_value ? [...display_value] : null;
	const temp_styling = styling ? [...styling] : null;

	indices.forEach((orig_idx, sorted_idx) => {
		data[sorted_idx] = temp_data[orig_idx];
		if (display_value && temp_display) {
			display_value[sorted_idx] = temp_display[orig_idx];
		}
		if (styling && temp_styling) {
			styling[sorted_idx] = temp_styling[orig_idx];
		}
	});
};
