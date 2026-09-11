import type { CellValue, Headers, HeadersWithIDs, TableData } from "../types";
import { dsvFormat } from "d3-dsv";

export function make_cell_id(row: number, col: number): string {
	return `cell-${row}-${col}`;
}

export function make_header_id(col: number): string {
	return `header-${col}`;
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

export async function handle_file_upload(
	file: Blob,
	update_headers: (headers: Headers) => HeadersWithIDs[],
	update_values: (values: CellValue[][]) => void
): Promise<void> {
	const text = await file.text();
	if (!text) return;
	// a single-column file has no delimiter to find, so fall back to a comma
	const [delimiter = ","] = guess_delimiter(text, [",", "\t"]);
	const [head, ...rest] = dsvFormat(delimiter).parseRows(text);
	update_headers(head);
	update_values(rest);
}
