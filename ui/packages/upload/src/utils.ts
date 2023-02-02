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
	} else if (Array.isArray(file)) {
		for (const x of file) {
			normalise_file(x, root);
		}
	} else if (file.is_file) {
		file.data = root + "file=" + file.name;
	}
	return file;
}

export function normalise_files(
	file: string | FileData | Array<FileData> | null,
	root: string
): FileData | Array<FileData> | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else if (Array.isArray(file)) {
		for (const x of file) {
			normalise_file(x, root);
		}
	} else if (file.is_file) {
		file.data = root + "file=" + file.name;
	}
	return file;
}
