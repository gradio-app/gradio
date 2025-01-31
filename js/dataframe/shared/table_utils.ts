import type { HeadersWithIDs } from "./utils";
import type { CellCoordinate } from "./selection_utils";

export type TableData = {
	value: string | number;
	id: string;
}[][];

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
