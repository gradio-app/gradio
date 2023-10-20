import type { FileData } from "./types";
import { upload_files } from "@gradio/client";

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
		file.data = get_fetchable_url_or_file(file.name, root, root_url);
	} else if (file.is_stream) {
		if (root_url == null) {
			file.data = root + "/stream/" + file.name;
		} else {
			file.data = "/proxy=" + root_url + "stream/" + file.name;
		}
	}
	return file;
}

function is_url(str: string): boolean {
	try {
		const url = new URL(str);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

export function get_fetchable_url_or_file(
	path: string | null,
	root: string,
	root_url: string | null
): string {
	if (path == null) {
		return root_url ? `/proxy=${root_url}file=` : `${root}/file=`;
	}
	if (is_url(path)) {
		return path;
	}
	return root_url ? `/proxy=${root_url}file=${path}` : `${root}/file=${path}`;
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

export async function upload(
	file_data: FileData[],
	root: string
): Promise<FileData[]> {
	let files = (Array.isArray(file_data) ? file_data : [file_data]).map(
		(file_data) => file_data.blob!
	);

	await upload_files(root, files).then(async (response) => {
		if (response.error) {
			(Array.isArray(file_data) ? file_data : [file_data]).forEach(
				async (file_data, i) => {
					file_data.data = await blobToBase64(file_data.blob!);
					file_data.blob = undefined;
				}
			);
		} else {
			(Array.isArray(file_data) ? file_data : [file_data]).forEach((f, i) => {
				if (response.files) {
					f.orig_name = f.name;
					f.name = response.files[i];
					f.is_file = true;
					f.blob = undefined;
					normalise_file(f, root, null);
				}
			});
		}
	});
	return file_data;
}

export async function prepareFiles(files: File[]): Promise<FileData[]> {
	var all_file_data: FileData[] = [];
	files.forEach((f, i) => {
		all_file_data[i] = {
			name: f.name,
			size: f.size,
			data: "",
			blob: f
		};
	});
	return all_file_data;
}
