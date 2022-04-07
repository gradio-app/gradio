import type { FileData } from "./types";

export function normalise_file(
	file: string | FileData | null
): FileData | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else return file;
}
