import type { FileData } from "./types";

export function normalise_file(
	file: string | FileData | null,
	root: string,
	root_url: string | null
): FileData | null;
export function normalise_file(
	file: Array<FileData> | FileData | null,
	root: string,
	root_url: string | null
): Array<FileData> | FileData | null;

export function normalise_file(
	file: string | FileData | Array<FileData> | null,
	root: string,
	root_url: string | null
): FileData | Array<FileData> | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else if (Array.isArray(file)) {
		for (const x of file) {
			normalise_file(x, root, root_url);
		}
	} else if (file.is_file) {
		if (root_url == null) {
			file.data = root + "file=" + file.name;
		} else {
			file.data = "proxy=" + root_url + "file=" + file.name;
		}
	}
	return file;
}

export const blobToBase64 = (blob: File): Promise<string> => {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return new Promise((resolve) => {
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
	});
};
