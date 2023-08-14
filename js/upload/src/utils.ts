import type { FileData } from "./types";

export function normalise_file(
	file: string | FileData | null,
	root: string,
	root_url: string | null
): FileData | null;

export function normalise_file(
	file: FileData[] | null,
	root: string,
	root_url: string | null
): FileData[] | null;

export function normalise_file(
	file: FileData[] | FileData | null,
	root: string,
	root_url: string | null
): FileData[] | FileData | null;

export function normalise_file(
	file: FileData[] | FileData | string | null,
	root: string,
	root_url: string | null
): FileData[] | FileData | null {
	if (file == null) return null;
	if (typeof file === "string") {
		return {
			name: "file_data",
			data: file
		};
	} else if (Array.isArray(file)) {
		const normalized_file: (FileData | null)[] = [];

		for (const x of file) {
			if (x === null) {
				normalized_file.push(null);
			} else {
				normalized_file.push(normalise_file(x, root, root_url));
			}
		}

		return normalized_file as FileData[];
	} else if (file.is_file) {
		if (root_url == null) {
			file.data = root + "/file=" + file.name;
		} else {
			file.data = "/proxy=" + root_url + "file=" + file.name;
		}
	} else if (file.is_stream) {
		if (root_url == null) {
			file.data = root + "/stream/" + file.name;
		} else {
			file.data = "/proxy=" + root_url + "stream/" + file.name;
		}
	}
	return file;
}

export const blobToBase64 = (blob: File): Promise<string> => {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return new Promise((resolve) => {
		reader.onloadend = (): void => {
			resolve(reader.result as string);
		};
	});
};
