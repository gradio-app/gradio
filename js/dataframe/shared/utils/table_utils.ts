import type { CellValue, Headers, TableData } from "../types";
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

export async function parse_table_file(
	file: File
): Promise<{ headers: Headers; values: CellValue[][] }> {
	const text = await file.text();
	if (!text.trim()) return { headers: [], values: [] };
	// the drop zone only accepts .csv and .tsv, so the extension goes first and
	// decides on its own for a single-column file, where neither separator splits
	// anything. a mislabeled file is still read by its content, and the split is
	// d3's rather than a raw count so a separator inside a quoted field does not
	// throw the detection off.
	const by_extension = file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
	const candidates = by_extension === "\t" ? ["\t", ","] : [",", "\t"];
	let rows: string[][] | undefined;
	for (const delimiter of candidates) {
		const parsed = dsvFormat(delimiter).parseRows(text);
		if ((parsed[0]?.length ?? 0) > 1) {
			rows = parsed;
			break;
		}
	}
	const [head = [], ...rest] = rows ?? dsvFormat(by_extension).parseRows(text);
	return { headers: head.map((h) => h ?? ""), values: rest };
}
