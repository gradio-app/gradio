import type {
	Headers,
	HeadersWithIDs,
	TableCell,
	TableData,
	CountConfig,
	ElementRefs,
	DataBinding
} from "../types";
import { sort_data } from "./sort_utils";
import type { SortDirection } from "./sort_utils";

export function make_cell_id(row: number, col: number): string {
	return `cell-${row}-${col}`;
}

export function make_header_id(col: number): string {
	return `header-${col}`;
}

export function sort_table_data(
	data: { id: string; value: string | number }[][],
	display_value: string[][] | null,
	styling: string[][] | null,
	col: number,
	dir: SortDirection
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

export function process_data(
	input_values: (string | number)[][],
	row_count: CountConfig,
	col_count: CountConfig,
	headers: Headers,
	show_row_numbers: boolean,
	element_refs: ElementRefs,
	data_binding: DataBinding
): TableData {
	const data_row_length = input_values.length;
	return Array(row_count[1] === "fixed" ? row_count[0] : data_row_length)
		.fill(0)
		.map((_, row) => {
			return Array(
				col_count[1] === "fixed"
					? col_count[0]
					: data_row_length > 0
						? input_values[0].length
						: headers.length
			)
				.fill(0)
				.map((_, col) => {
					const cell_id = make_cell_id(row, col);
					element_refs[cell_id] = element_refs[cell_id] || {
						input: null,
						cell: null
					};
					const cell_obj: TableCell = {
						value: input_values?.[row]?.[col] ?? "",
						id: cell_id
					};
					data_binding[cell_id] = cell_obj;
					return cell_obj;
				});
		});
}

export function make_headers(
	input_headers: Headers,
	show_row_numbers: boolean,
	col_count: CountConfig,
	element_refs: ElementRefs
): HeadersWithIDs[] {
	let header_list = input_headers || [];
	if (show_row_numbers) {
		header_list = ["", ...header_list];
	}
	if (col_count[1] === "fixed" && header_list.length < col_count[0]) {
		const fill_headers = Array(col_count[0] - header_list.length)
			.fill("")
			.map((_, i) => `${i + header_list.length}`);
		header_list = header_list.concat(fill_headers);
	}

	if (!header_list || header_list.length === 0) {
		return Array(col_count[0])
			.fill(0)
			.map((_, col) => {
				const header_id = make_header_id(col);
				element_refs[header_id] = { cell: null, input: null };
				return { id: header_id, value: JSON.stringify(col + 1) };
			});
	}

	return header_list.map((header: string | null, col: number) => {
		const header_id = make_header_id(col);
		element_refs[header_id] = { cell: null, input: null };
		return { id: header_id, value: header ?? "" };
	});
}

export function get_data_at(
	data: TableData,
	row: number,
	col: number
): string | number | undefined {
	return data?.[row]?.[col]?.value;
}

export function get_max(data: TableData): TableCell[] {
	if (!data || !data.length) return [];
	return data[0];
}

export async function copy_table_data(
	data: TableData,
	selected_cells: [number, number][]
): Promise<void> {
	const selected_data = selected_cells.map(
		([row, col]) => data[row][col].value
	);
	await navigator.clipboard.writeText(selected_data.join("\t"));
}

export function handle_file_upload(
	data: any,
	update_headers: (headers: Headers) => HeadersWithIDs[],
	update_values: (values: (string | number)[][]) => void
): void {
	if (!data || !data.length) return;
	const headers = data[0];
	const values = data.slice(1);
	update_headers(headers);
	update_values(values);
}
