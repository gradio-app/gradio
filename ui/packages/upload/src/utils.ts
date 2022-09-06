import type { FileData } from "./types";

export function normalise_file(
	file: string | FileData | null,
	root: string
): FileData | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else if (file.is_file) {
		file.data = root + "file=" + file.name;
	} else if (Array.isArray(file)) {
		for (const x of file) {
			normalise_file(x, root)
		}
	}
	return file;
}
