import type { HeadersWithIDs } from "./utils";
import type { CellCoordinate } from "./selection_utils";
import { dsvFormat } from "d3-dsv";

export type TableData = {
	value: string | number;
	id: string;
}[][];

export function get_max(_d: TableData): TableData[0] {
	if (!_d || _d.length === 0 || !_d[0]) return [];
	let max = _d[0].slice();
	for (let i = 0; i < _d.length; i++) {
		for (let j = 0; j < _d[i].length; j++) {
			if (`${max[j].value}`.length < `${_d[i][j].value}`.length) {
				max[j] = _d[i][j];
			}
		}
	}
	return max;
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

export async function copy_table_data(
	data: TableData,
	headers?: HeadersWithIDs,
	selected_cells?: CellCoordinate[]
): Promise<void> {
	if (!selected_cells || selected_cells.length === 0) {
		const header_row = headers
			? headers.map((h) => String(h.value)).join(",")
			: "";
		const table_data = data
			.map((row) => row.map((cell) => String(cell.value)).join(","))
			.join("\n");

		const all_data = header_row ? `${header_row}\n${table_data}` : table_data;
		await write_to_clipboard(all_data);
		return;
	}

	const min_row = Math.min(...selected_cells.map(([r]) => r));
	const max_row = Math.max(...selected_cells.map(([r]) => r));
	const min_col = Math.min(...selected_cells.map(([_, c]) => c));
	const max_col = Math.max(...selected_cells.map(([_, c]) => c));

	const selected_data = [];
	for (let i = min_row; i <= max_row; i++) {
		const row = [];
		for (let j = min_col; j <= max_col; j++) {
			const is_selected = selected_cells.some(([r, c]) => r === i && c === j);
			row.push(is_selected ? String(data[i][j].value) : "");
		}
		selected_data.push(row.join(","));
	}

	await write_to_clipboard(selected_data.join("\n"));
}

async function write_to_clipboard(csv_data: string): Promise<void> {
	try {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(csv_data);
		} else {
			const textArea = document.createElement("textarea");
			textArea.value = csv_data;
			textArea.style.position = "absolute";
			textArea.style.left = "-999999px";
			document.body.prepend(textArea);
			textArea.select();

			document.execCommand("copy");
			textArea.remove();
		}
	} catch (error) {
		console.error("Failed to copy table data:", error);
	}
}

export function blob_to_string(
	blob: Blob,
	col_count: [number, "fixed" | "dynamic"],
	make_headers: (head: string[]) => HeadersWithIDs,
	set_values: (values: (string | number)[][]) => void
): void {
	const reader = new FileReader();

	function handle_read(e: ProgressEvent<FileReader>): void {
		if (!e?.target?.result || typeof e.target.result !== "string") return;

		const [delimiter] = guess_delimiter(e.target.result, [",", "\t"]);
		const [head, ...rest] = dsvFormat(delimiter).parseRows(e.target.result);

		make_headers(col_count[1] === "fixed" ? head.slice(0, col_count[0]) : head);
		set_values(rest);
		reader.removeEventListener("loadend", handle_read);
	}

	reader.addEventListener("loadend", handle_read);
	reader.readAsText(blob);
}

export function handle_file_upload(
	data_uri: string,
	col_count: [number, "fixed" | "dynamic"],
	make_headers: (head: string[]) => HeadersWithIDs,
	set_values: (values: (string | number)[][]) => void
): void {
	const blob = data_uri_to_blob(data_uri);
	const reader = new FileReader();
	reader.addEventListener("loadend", (e) => {
		if (!e?.target?.result || typeof e.target.result !== "string") return;
		const [delimiter] = guess_delimiter(e.target.result, [",", "\t"]);
		const [head, ...rest] = dsvFormat(delimiter).parseRows(e.target.result);
		make_headers(col_count[1] === "fixed" ? head.slice(0, col_count[0]) : head);
		set_values(rest);
	});
	reader.readAsText(blob);
}
