import { update_object, walk_and_store_blobs } from "../helpers/data";
import {
	Command,
	type ApiData,
	type EndpointInfo,
	type JsApiData
} from "../types";
import { FileData } from "../upload";
import type { Client } from "..";
import {
	FILE_PROCESSING_ERROR_MSG,
	NODEJS_FS_ERROR_MSG,
	ROOT_URL_ERROR_MSG
} from "../constants";

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
				name:
					typeof File !== "undefined" && blob instanceof File
						? blob?.name
						: undefined
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
		throw new Error(ROOT_URL_ERROR_MSG);
	}

	await recursively_process_commands(client, data);
}

async function recursively_process_commands(
	client: Client,
	data: any,
	path: string[] = []
): Promise<void> {
	for (const key in data) {
		if (data[key] instanceof Command) {
			await process_single_command(client, data, key);
		} else if (typeof data[key] === "object" && data[key] !== null) {
			await recursively_process_commands(client, data[key], [...path, key]);
		}
	}
}

async function process_single_command(
	client: Client,
	data: any,
	key: string
): Promise<void> {
	let cmd_item = data[key] as Command;
	const root = client.config?.root || client.config?.root_url;

	if (!root) {
		throw new Error(ROOT_URL_ERROR_MSG);
	}

	try {
		let fileBuffer: Buffer;
		let fullPath: string;

		// check if running in a Node.js environment
		if (
			typeof process !== "undefined" &&
			process.versions &&
			process.versions.node
		) {
			const fs = await import("fs/promises");
			const path = await import("path");

			fullPath = path.resolve(process.cwd(), cmd_item.meta.path);
			fileBuffer = await fs.readFile(fullPath); // Read file from disk
		} else {
			throw new Error(NODEJS_FS_ERROR_MSG);
		}

		const file = new Blob([fileBuffer], { type: "application/octet-stream" });

		const response = await client.upload_files(root, [file]);

		const file_url = response.files && response.files[0];

		if (file_url) {
			const fileData = new FileData({
				path: file_url,
				orig_name: cmd_item.meta.name || ""
			});

			// replace the command object with the fileData object
			data[key] = fileData;
		}
	} catch (error) {
		console.error(FILE_PROCESSING_ERROR_MSG, error);
	}
}
