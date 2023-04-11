import type { FileData } from "./types";

export function normalise_file(
	file: string | FileData | null,
	root: string,
	root_url: string | null
): FileData | null;

export function normalise_file(
	file: Array<FileData> | null,
	root: string,
	root_url: string | null
): Array<FileData> | null;

export function normalise_file(
	file: Array<FileData> | FileData | null,
	root: string,
	root_url: string | null
): Array<FileData> | FileData | null;

export function normalise_file(
	file: Array<FileData> | FileData | string | null,
	root: string,
	root_url: string | null
): Array<FileData> | FileData | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else if (Array.isArray(file)) {
		const normalized_file: Array<FileData | null> = [];

		for (const x of file) {
			if (x === null) {
				normalized_file.push(null);
			} else {
				normalized_file.push(normalise_file(x, root, root_url));
			}
		}

		return normalized_file as Array<FileData>;
	} else if (file.is_file) {
		if (root_url == null) {
			file.data = root + "/file=" + file.name;
		} else {
			file.data = "/proxy=" + root_url + "/file=" + file.name;
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
