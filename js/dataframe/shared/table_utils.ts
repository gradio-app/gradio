import type { HeadersWithIDs } from "./utils";

export type TableData = {
	value: string | number;
	id: string;
}[][];

export async function copy_table_data(
	data: TableData,
	headers?: HeadersWithIDs
): Promise<void> {
	const header_row = headers
		? headers.map((h) => String(h.value)).join(",")
		: "";
	const table_data = data
		.map((row) => row.map((cell) => String(cell.value)).join(","))
		.join("\n");

	const all_data = header_row ? `${header_row}\n${table_data}` : table_data;

	try {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(all_data);
		} else {
			const textArea = document.createElement("textarea");
			textArea.value = all_data;
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
