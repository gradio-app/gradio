import type { CellValue, Headers, HeadersWithIDs, TableData } from "../types";
import { dsvFormat } from "d3-dsv";

export function make_cell_id(row: number, col: number): string {
	return `cell-${row}-${col}`;
}

export function make_header_id(col: number): string {
	return `header-${col}`;
}

// the cells are always spelled out by the caller. a `null` here used to mean
// "every row in `data`", which reaches past whatever the view is showing, so
// the parameter no longer accepts one
export async function copy_table_data(
	data: TableData,
	selected_cells: [number, number][]
): Promise<void> {
	if (!data || !data.length) return;

	const csv = selected_cells.reduce(
		(acc: { [key: string]: { [key: string]: string } }, [row, col]) => {
			acc[row] = acc[row] || {};
			// only the headers are padded out to the column count on the way in,
			// so a row can be shorter than the header row and a selection can
			// hold a cell that is not in the data at all. a cell that is there
			// keeps going through `String`, `null` included, so this covers the
			// missing one and nothing else
			const cell = data[row]?.[col];
			const value = cell ? String(cell.value) : "";
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

	// every column any selected row contributes, not just the ones the first of
	// them happens to hold: a selection that is not rectangular there would
	// otherwise have its remaining cells dropped from the output entirely
	const cols = Array.from(
		new Set(rows.flatMap((r) => Object.keys(csv[r])))
	).sort((a, b) => +a - +b);
	const text = rows
		.map((r) => cols.map((c) => csv[r][c] || "").join(","))
		.join("\n");

	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		throw new Error("Failed to copy to clipboard: " + (err as Error).message);
	}
}

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
	update_values: (values: CellValue[][]) => void
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
