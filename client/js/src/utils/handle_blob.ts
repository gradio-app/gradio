import { update_object, walk_and_store_blobs } from "../helpers/data";
import type { ApiData, EndpointInfo, JsApiData } from "../types";
import { upload_files } from "./upload_files";
import { FileData } from "../upload";

export async function handle_blob(
	endpoint: string,
	data: unknown[],
	api_info: EndpointInfo<JsApiData | ApiData>,
	fetch_implementation: typeof fetch = fetch,
	hf_token?: `hf_${string}`
): Promise<unknown[]> {
	const blobRefs = await walk_and_store_blobs(
		data,
		undefined,
		[],
		true,
		api_info
	);

	const results = await Promise.all(
		blobRefs.map(async ({ path, blob, type }) => {
			if (!blob) return { path, type };

			const response = await upload_files(
				endpoint,
				[blob],
				fetch_implementation,
				hf_token
			);
			const file_url = response.files && response.files[0];
			return {
				path,
				file_url,
				type,
				name: blob?.name
			};
		})
	);

	results.forEach(({ path, file_url, type, name }) => {
		if (type === "Gallery") {
			update_object(data, file_url, path);
		} else if (file_url) {
			const file = new FileData({ path: file_url, orig_name: name });
			update_object(data, file, path);
		}
	});

	return data;
}
