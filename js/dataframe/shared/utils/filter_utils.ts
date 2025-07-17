import { filter_table_data } from "./table_utils";

export type FilterDatatype = "string" | "number";

export function filter_data(
	data: { id: string; value: string | number }[][],
	filter_columns: {
		col: number;
		datatype: FilterDatatype;
		filter: string;
		value: string;
	}[]
): number[] {
	if (!data || !data.length || !data[0]) {
		return [];
	}
	let row_indices = [...Array(data.length)].map((_, i) => i);

	if (filter_columns.length > 0) {
		filter_columns.forEach((column) => {
			if (column.datatype === "string") {
				switch (column.filter) {
					case "Contains":
						row_indices = row_indices.filter((i) =>
							data[i][column.col]?.value.toString().includes(column.value)
						);
						break;
					case "Does not contain":
						row_indices = row_indices.filter(
							(i) =>
								!data[i][column.col]?.value.toString().includes(column.value)
						);
						break;
					case "Starts with":
						row_indices = row_indices.filter((i) =>
							data[i][column.col]?.value.toString().startsWith(column.value)
						);
						break;
					case "Ends with":
						row_indices = row_indices.filter((i) =>
							data[i][column.col]?.value.toString().endsWith(column.value)
						);
						break;
					case "Is":
						row_indices = row_indices.filter(
							(i) => data[i][column.col]?.value.toString() === column.value
						);
						break;
					case "Is not":
						row_indices = row_indices.filter(
							(i) => !(data[i][column.col]?.value.toString() === column.value)
						);
						break;
					case "Is empty":
						row_indices = row_indices.filter(
							(i) => data[i][column.col]?.value.toString() === ""
						);
						break;
					case "Is not empty":
						row_indices = row_indices.filter(
							(i) => !(data[i][column.col]?.value.toString() === "")
						);
						break;
				}
			} else if (column.datatype === "number") {
				switch (column.filter) {
					case "=":
						row_indices = row_indices.filter((i) => {
							if (
								!isNaN(Number(data[i][column.col]?.value)) &&
								!isNaN(Number(column.value))
							) {
								return (
									Number(data[i][column.col]?.value) === Number(column.value)
								);
							}
							return false;
						});
						break;
					case "≠":
						row_indices = row_indices.filter((i) => {
							if (
								!isNaN(Number(data[i][column.col]?.value)) &&
								!isNaN(Number(column.value))
							) {
								return !(
									Number(data[i][column.col]?.value) === Number(column.value)
								);
							}
							return false;
						});
						break;
					case ">":
						row_indices = row_indices.filter((i) => {
							if (
								!isNaN(Number(data[i][column.col]?.value)) &&
								!isNaN(Number(column.value))
							) {
								return (
									Number(data[i][column.col]?.value) > Number(column.value)
								);
							}
							return false;
						});
						break;
					case "<":
						row_indices = row_indices.filter((i) => {
							if (
								!isNaN(Number(data[i][column.col]?.value)) &&
								!isNaN(Number(column.value))
							) {
								return (
									Number(data[i][column.col]?.value) < Number(column.value)
								);
							}
							return false;
						});
						break;
					case "≥":
						row_indices = row_indices.filter((i) => {
							if (
								!isNaN(Number(data[i][column.col]?.value)) &&
								!isNaN(Number(column.value))
							) {
								return (
									Number(data[i][column.col]?.value) >= Number(column.value)
								);
							}
							return false;
						});
						break;
					case "≤":
						row_indices = row_indices.filter((i) => {
							if (
								!isNaN(Number(data[i][column.col]?.value)) &&
								!isNaN(Number(column.value))
							) {
								return (
									Number(data[i][column.col]?.value) <= Number(column.value)
								);
							}
							return false;
						});
						break;
					case "Is empty":
						row_indices = row_indices.filter(
							(i) => data[i][column.col]?.value.toString() === ""
						);
						break;
					case "Is not empty":
						row_indices = row_indices.filter((i) => {
							if (!isNaN(Number(data[i][column.col]?.value))) {
								return !(data[i][column.col]?.value.toString() === "");
							}
							return false;
						});
						break;
				}
			}
		});
		return row_indices;
	}
	return [...Array(data.length)].map((_, i) => i);
}

export function filter_data_and_preserve_selection(
	data: { id: string; value: string | number }[][],
	display_value: string[][] | null,
	styling: string[][] | null,
	filter_columns: {
		col: number;
		datatype: FilterDatatype;
		filter: string;
		value: string;
	}[],
	selected: [number, number] | false,
	get_current_indices: (
		id: string,
		data: { id: string; value: string | number }[][]
	) => [number, number],
	original_data?: { id: string; value: string | number }[][],
	original_display_value?: string[][] | null,
	original_styling?: string[][] | null
): { data: typeof data; selected: [number, number] | false } {
	let id = null;
	if (selected && selected[0] in data && selected[1] in data[selected[0]]) {
		id = data[selected[0]][selected[1]].id;
	}

	filter_table_data(
		data,
		display_value,
		styling,
		filter_columns,
		original_data,
		original_display_value,
		original_styling
	);

	let new_selected = selected;
	if (id) {
		const [i, j] = get_current_indices(id, data);
		new_selected = [i, j];
	}

	return { data, selected: new_selected };
}
