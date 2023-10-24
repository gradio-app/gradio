import type { FileData } from "./types";
import { upload_files } from "@gradio/client";

export function normalise_file(
	file: FileData | null,
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
): FileData[] | FileData | null {
	if (file == null) return null;
	if (Array.isArray(file)) {
		const normalized_file: (FileData | null)[] = [];

		for (const x of file) {
			if (x === null) {
				normalized_file.push(null);
			} else {
				normalized_file.push(normalise_file(x, root, root_url));
			}
		}

		return normalized_file as FileData[];
	}

	if (file.is_stream) {
		if (root_url == null) {
			file.path = root + "/stream/" + file.path;
		} else {
			file.path = "/proxy=" + root_url + "stream/" + file.path;
		}
	} else {
		file.path = get_fetchable_url_or_file(file.path, root, root_url);
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

export async function upload(
	file_data: FileData[],
	root: string,
	upload_fn: typeof upload_files | undefined = upload_files
): Promise<FileData[]> {
	let files = (Array.isArray(file_data) ? file_data : [file_data]).map(
		(file_data) => file_data.blob!
	);

	await upload_fn(root, files).then(async (response) => {
		if (response.error) {
			throw new Error(response.error);
		} else {
			(Array.isArray(file_data) ? file_data : [file_data]).forEach((f, i) => {
				if (response.files) {
					f.orig_name = f.orig_name;
					f.path = response.files[i];
					f.blob = undefined;
					normalise_file(f, root, null);
				}
			});
		}
	});
	return file_data;
}

export async function prepare_files(files: File[]): Promise<FileData[]> {
	var all_file_data: FileData[] = [];
	files.forEach((f, i) => {
		all_file_data[i] = {
			orig_name: f.name,
			path: f.name,
			size: f.size,
			blob: f
		};
	});
	return all_file_data;
}
