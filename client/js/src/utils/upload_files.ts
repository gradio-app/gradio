import type { Client } from "..";
import { BROKEN_CONNECTION_MSG } from "../constants";
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
	if (this.options.hf_token) {
		headers.Authorization = `Bearer ${this.options.hf_token}`;
	}
	const chunkSize = 1000;
	const uploadResponses = [];
	for (let i = 0; i < files.length; i += chunkSize) {
		const chunk = files.slice(i, i + chunkSize);
		const formData = new FormData();
		chunk.forEach((file) => {
			formData.append("files", file);
		});
		try {
			const upload_url = upload_id
				? `${root_url}/upload?upload_id=${upload_id}`
				: `${root_url}/upload`;
			var response = await this.fetch_implementation(upload_url, {
				method: "POST",
				body: formData,
				headers
			});
		} catch (e) {
			return { error: BROKEN_CONNECTION_MSG };
		}
		if (!response.ok) {
			return { error: await response.text() };
		}
		const output: UploadResponse["files"] = await response.json();
		if (output) {
			uploadResponses.push(...output);
		}
	}
	return { files: uploadResponses };
}
