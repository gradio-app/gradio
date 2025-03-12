import type { Headers, HeadersWithIDs, TableCell, TableData } from "../types";
import { sort_data } from "./sort_utils";
import type { SortDirection } from "./sort_utils";
import { dsvFormat } from "d3-dsv";

export function make_cell_id(row: number, col: number): string {
	return `cell-${row}-${col}`;
}

export function make_header_id(col: number): string {
	return `header-${col}`;
}

export function get_max(data: TableData): TableCell[] {
	if (!data || !data.length) return [];
	let max = data[0].slice();
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			if (`${max[j].value}`.length < `${data[i][j].value}`.length) {
				max[j] = data[i][j];
			}
		}
	}
	return max;
}

export function sort_table_data(
	data: TableData,
	display_value: string[][] | null,
	styling: string[][] | null,
	sort_columns: { col: number; direction: SortDirection }[]
): void {
	if (!sort_columns.length) return;
	if (!data || !data.length) return;

	const indices = sort_data(data, sort_columns);

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

export async function copy_table_data(
	data: TableData,
	selected_cells: [number, number][] | null
): Promise<void> {
	if (!data || !data.length) return;

	const cells_to_copy =
		selected_cells ||
		data.flatMap((row, r) => row.map((_, c) => [r, c] as [number, number]));

	const csv = cells_to_copy.reduce(
		(acc: { [key: string]: { [key: string]: string } }, [row, col]) => {
			acc[row] = acc[row] || {};
			const value = String(data[row][col].value);
			acc[row][col] =
				value.includes(",") || value.includes('"') || value.includes("\n")
					? `"${value.replace(/"/g, '""')}"`
					: value;
			return acc;
		},
		{}
	);

	const rows = Object.keys(csv).sort((a, b) => +a - +b);
	if (!rows.length) return;

	const cols = Object.keys(csv[rows[0]]).sort((a, b) => +a - +b);
	const text = rows
		.map((r) => cols.map((c) => csv[r][c] || "").join(","))
		.join("\n");

	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		throw new Error("Failed to copy to clipboard: " + (err as Error).message);
	}
}

// File Import/Export
export function guess_delimiter(
	text: string,
	possibleDelimiters: string[]
): string[] {
	return possibleDelimiters.filter(weedOut);

	function weedOut(delimiter: string): boolean {
		var cache = -1;
		return text.split("\n").every(checkLength);

		function checkLength(line: string): boolean {
			if (!line) return true;
			var length = line.split(delimiter).length;
			if (cache < 0) cache = length;
			return cache === length && length > 1;
		}
	}
}

export function data_uri_to_blob(data_uri: string): Blob {
	const byte_str = atob(data_uri.split(",")[1]);
	const mime_str = data_uri.split(",")[0].split(":")[1].split(";")[0];
	const ab = new ArrayBuffer(byte_str.length);
	const ia = new Uint8Array(ab);
	for (let i = 0; i < byte_str.length; i++) {
		ia[i] = byte_str.charCodeAt(i);
	}
	return new Blob([ab], { type: mime_str });
}

export function handle_file_upload(
	data_uri: string,
	update_headers: (headers: Headers) => HeadersWithIDs[],
	update_values: (values: (string | number)[][]) => void
): void {
	const blob = data_uri_to_blob(data_uri);
	const reader = new FileReader();
	reader.addEventListener("loadend", (e) => {
		if (!e?.target?.result || typeof e.target.result !== "string") return;
		const [delimiter] = guess_delimiter(e.target.result, [",", "\t"]);
		const [head, ...rest] = dsvFormat(delimiter).parseRows(e.target.result);
		update_headers(head);
		update_values(rest);
	});
	reader.readAsText(blob);
}
