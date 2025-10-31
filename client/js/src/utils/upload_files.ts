import type { Client } from "..";
import { BROKEN_CONNECTION_MSG, UPLOAD_URL } from "../constants";
import type { UploadResponse } from "../types";

export async function upload_files(
	this: Client,
	root_url: string,
	files: (Blob | File)[],
	upload_id?: string
): Promise<UploadResponse> {
	const headers: {
		Authorization?: string;
	} = {};
	if (this?.options?.token) {
		headers.Authorization = `Bearer ${this.options.token}`;
	}

	const chunkSize = 1000;
	const uploadResponses = [];
	let response: Response;

	for (let i = 0; i < files.length; i += chunkSize) {
		const chunk = files.slice(i, i + chunkSize);
		const formData = new FormData();
		chunk.forEach((file) => {
			formData.append("files", file);
		});
		try {
			const upload_url = upload_id
				? `${root_url}${this.api_prefix}/${UPLOAD_URL}?upload_id=${upload_id}`
				: `${root_url}${this.api_prefix}/${UPLOAD_URL}`;

			response = await this.fetch(upload_url, {
				method: "POST",
				body: formData,
				headers,
				credentials: "include"
			});
		} catch (e) {
			throw new Error(BROKEN_CONNECTION_MSG + (e as Error).message);
		}
		if (!response.ok) {
			const error_text = await response.text();
			return { error: `HTTP ${response.status}: ${error_text}` };
		}
		const output: UploadResponse["files"] = await response.json();
		if (output) {
			uploadResponses.push(...output);
		}
	}
	return { files: uploadResponses };
}
