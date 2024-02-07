import { upload_files } from "./client";

export function normalise_file(
	file: FileData | null,
	server_url: string,
	proxy_url: string | null
): FileData | null;

export function normalise_file(
	file: FileData[] | null,
	server_url: string,
	proxy_url: string | null
): FileData[] | null;

export function normalise_file(
	file: FileData[] | FileData | null,
	server_url: string, // root: string,
	proxy_url: string | null // root_url: string | null
): FileData[] | FileData | null;

/*
This function is now a no-op, but it used to be used to normalise the file paths.
The file paths are now normalised on the server, so this function is no longer needed,
but is kept for backwards compatibility with custom components created using older 
versions of Gradio.
*/
export function normalise_file(
	file: FileData[] | FileData | null,
	server_url: string, // root: string,
	proxy_url: string | null // root_url: string | null
): FileData[] | FileData | null {
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
	server_url: string,
	proxy_url: string | null
): string {
	if (path == null) {
		return proxy_url ? `/proxy=${proxy_url}file=` : `${server_url}/file=`;
	}
	if (is_url(path)) {
		return path;
	}
	return proxy_url
		? `/proxy=${proxy_url}file=${path}`
		: `${server_url}/file=${path}`;
}

export async function upload(
	file_data: FileData[],
	root: string,
	upload_id?: string,
	upload_fn: typeof upload_files = upload_files
): Promise<(FileData | null)[] | null> {
	let files = (Array.isArray(file_data) ? file_data : [file_data]).map(
		(file_data) => file_data.blob!
	);

	return await Promise.all(
		await upload_fn(root, files, undefined, upload_id).then(
			async (response: { files?: string[]; error?: string }) => {
				if (response.error) {
					throw new Error(response.error);
				} else {
					if (response.files) {
						return response.files.map((f, i) => {
							const file = new FileData({ ...file_data[i], path: f });

							return normalise_file(file, root, null);
						});
					}

					return [];
				}
			}
		)
	);
}

export async function prepare_files(
	files: File[],
	is_stream?: boolean
): Promise<FileData[]> {
	return files.map(
		(f, i) =>
			new FileData({
				path: f.name,
				orig_name: f.name,
				blob: f,
				size: f.size,
				mime_type: f.type,
				is_stream
			})
	);
}

export class FileData {
	path: string;
	url?: string;
	orig_name?: string;
	size?: number;
	blob?: File;
	is_stream?: boolean;
	mime_type?: string;
	alt_text?: string;

	constructor({
		path,
		url,
		orig_name,
		size,
		blob,
		is_stream,
		mime_type,
		alt_text
	}: {
		path: string;
		url?: string;
		orig_name?: string;
		size?: number;
		blob?: File;
		is_stream?: boolean;
		mime_type?: string;
		alt_text?: string;
	}) {
		this.path = path;
		this.url = url;
		this.orig_name = orig_name;
		this.size = size;
		this.blob = url ? undefined : blob;
		this.is_stream = is_stream;
		this.mime_type = mime_type;
		this.alt_text = alt_text;
	}
}
