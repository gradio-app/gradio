import type {
	Headers,
	HeadersWithIDs,
	TableCell,
	TableData,
	CountConfig,
	ElementRefs,
	DataBinding
} from "../types";

export function make_cell_id(row: number, col: number): string {
	return `cell-${row}-${col}`;
}

export function make_header_id(col: number): string {
	return `header-${col}`;
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
			const row_data = Array(
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

			if (show_row_numbers) {
				const row_num_id = make_cell_id(row, -1);
				element_refs[row_num_id] = { cell: null, input: null };
				const row_num_obj: TableCell = { value: row + 1, id: row_num_id };
				data_binding[row_num_id] = row_num_obj;
				return [row_num_obj, ...row_data];
			}

			return row_data;
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
