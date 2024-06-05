import { update_object, walk_and_store_blobs } from "../helpers/data";
import {
	Command,
	type ApiData,
	type EndpointInfo,
	type JsApiData
} from "../types";
import { FileData } from "../upload";
import type { Client } from "..";

export async function handle_blob(
	this: Client,
	endpoint: string,
	data: unknown[],
	api_info: EndpointInfo<JsApiData | ApiData>
): Promise<unknown[]> {
	const self = this;

	await process_local_file_commands(self, data);

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

			const response = await self.upload_files(endpoint, [blob]);
			const file_url = response.files && response.files[0];
			return {
				path,
				file_url,
				type,
				name: blob instanceof File ? blob?.name : undefined
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

export async function process_local_file_commands(
	client: Client,
	data: unknown[]
): Promise<void> {
	const root = client.config?.root || client.config?.root_url;

	if (!root) {
		throw new Error("Root URL not found in client config");
	}

	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		if (
			item instanceof Command &&
			item.type === "command" &&
			item.command === "upload_file"
		) {
			let cmd_item = item as Command;

			try {
				let fileBuffer: Buffer;

				// check if running in a Node.js environment
				if (
					typeof process !== "undefined" &&
					process.versions &&
					process.versions.node
				) {
					const fs = await import("fs/promises");
					fileBuffer = await fs.readFile(cmd_item.meta.path);
				} else {
					throw new Error(
						"File system access is only available in Node.js environments"
					);
				}

				const blob = new Blob([fileBuffer], {
					type: "application/octet-stream"
				});
				const response = await client.upload_files(root, [blob]); // Upload the file

				const file_url = response.files && response.files[0];

				if (file_url) {
					const fileData = new FileData({
						path: file_url,
						orig_name: cmd_item.meta.name || ""
					});

					// replace the command object with the fileData object
					data[i] = fileData;
				} else {
					console.error("File upload failed, no file URL returned");
				}
			} catch (error) {
				console.error("Error processing upload_file command:", error);
			}
		}
	}
}
