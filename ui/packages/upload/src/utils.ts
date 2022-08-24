import type { FileData } from "./types";

export function normalise_file(
	file: string | FileData | null,
	root: string
): FileData | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			file_name: "file_data",
			data: file
		};
	} else if (file.is_file) {
		file.data = root + "file/" + file.tmp_file;
	}
	return file;
}
