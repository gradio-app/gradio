export type TableData = {
	value: string | number;
	id: string;
}[][];

export async function copy_table_data(data: TableData): Promise<void> {
	const table_data = data
		.map((row) => row.map((cell) => String(cell.value)).join("\t"))
		.join("\n");

	try {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(table_data);
		} else {
			const textArea = document.createElement("textarea");
			textArea.value = table_data;
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
