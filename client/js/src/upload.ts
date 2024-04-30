import type { UploadResponse } from "./types";
import type { Client } from "./client";

export async function upload(
	this: Client,
	file_data: FileData[],
	root_url: string,
	upload_id?: string,
	max_file_size?: number
): Promise<(FileData | null)[] | null> {
	let files = (Array.isArray(file_data) ? file_data : [file_data]).map(
		(file_data) => file_data.blob!
	);

	const oversized_files = files.filter(
		(f) => f.size > (max_file_size ?? Infinity)
	);
	if (oversized_files.length) {
		throw new Error(
			`File size exceeds the maximum allowed size of ${max_file_size} bytes: ${oversized_files
				.map((f) => f.name)
				.join(", ")}`
		);
	}

	return await Promise.all(
		await this.upload_files(root_url, files, upload_id).then(
			async (response: { files?: string[]; error?: string }) => {
				if (response.error) {
					throw new Error(response.error);
				} else {
					if (response.files) {
						return response.files.map((f, i) => {
							const file = new FileData({
								...file_data[i],
								path: f,
								url: root_url + "/file=" + f
							});
							return file;
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
		(f) =>
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
	readonly meta = { _type: "gradio.FileData" };

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
