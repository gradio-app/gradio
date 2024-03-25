import { BROKEN_CONNECTION_MSG } from "../constants";
import { UploadResponse } from "../types";

export async function upload_files(
	root: string,
	files: (Blob | File)[],
	token?: `hf_${string}`,
	upload_id?: string
): Promise<UploadResponse> {
	const headers: {
		Authorization?: string;
	} = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
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
				? `${root}/upload?upload_id=${upload_id}`
				: `${root}/upload`;
			var response = await fetch(upload_url, {
				method: "POST",
				body: formData,
				headers
			});
		} catch (e) {
			return { error: BROKEN_CONNECTION_MSG };
		}
		const output: UploadResponse["files"] = await response.json();
		if (output) {
			uploadResponses.push(...output);
		}
	}
	return { files: uploadResponses };
}
