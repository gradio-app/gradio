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
	} 
    
	return file;
}

export function normalise_files(
	files: Array<FileData> | Array<string> | null,
	root: string
): Array<FileData> | null {
	if (files == null) return null;
	else if (files.length == 0) return new Array<FileData>();
    else {
        let norm_files = new Array<FileData>(files.length);
        for (const [idx, x] of files.entries()) {
            norm_files[idx] = normalise_file(x, root) as FileData;
        }
        return norm_files;
    }
}