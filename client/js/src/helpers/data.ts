import {
	type ApiData,
	type BlobRef,
	type Config,
	type EndpointInfo,
	type JsApiData,
	type DataType,
	Command,
	type Dependency,
	type ComponentMeta
} from "../types";
import { FileData } from "../upload";

const is_node =
	typeof process !== "undefined" && process.versions && process.versions.node;

export function update_object(
	object: { [x: string]: any },
	newValue: any,
	stack: (string | number)[]
): void {
	while (stack.length > 1) {
		const key = stack.shift();
		if (typeof key === "string" || typeof key === "number") {
			object = object[key];
		} else {
			throw new Error("Invalid key type");
		}
	}

	const key = stack.shift();
	if (typeof key === "string" || typeof key === "number") {
		object[key] = newValue;
	} else {
		throw new Error("Invalid key type");
	}
}

export async function walk_and_store_blobs(
	data: DataType,
	type: string | undefined = undefined,
	path: string[] = [],
	root = false,
	endpoint_info: EndpointInfo<ApiData | JsApiData> | undefined = undefined
): Promise<BlobRef[]> {
	if (Array.isArray(data)) {
		let blob_refs: BlobRef[] = [];

		await Promise.all(
			data.map(async (_, index) => {
				let new_path = path.slice();
				new_path.push(String(index));

				const array_refs = await walk_and_store_blobs(
					data[index],
					root
						? endpoint_info?.parameters[index]?.component || undefined
						: type,
					new_path,
					false,
					endpoint_info
				);

				blob_refs = blob_refs.concat(array_refs);
			})
		);

		return blob_refs;
	} else if (
		(globalThis.Buffer && data instanceof globalThis.Buffer) ||
		data instanceof Blob
	) {
		return [
			{
				path: path,
				blob: new Blob([data]),
				type
			}
		];
	} else if (typeof data === "object" && data !== null) {
		let blob_refs: BlobRef[] = [];
		for (const key of Object.keys(data) as (keyof typeof data)[]) {
			const new_path = [...path, key];
			const value = data[key];

			blob_refs = blob_refs.concat(
				await walk_and_store_blobs(
					value,
					undefined,
					new_path,
					false,
					endpoint_info
				)
			);
		}

		return blob_refs;
	}

	return [];
}

export function skip_queue(id: number, config: Config): boolean {
	let fn_queue = config?.dependencies?.find((dep) => dep.id == id)?.queue;
	if (fn_queue != null) {
		return !fn_queue;
	}
	return !config.enable_queue;
}

// todo: add jsdoc for this function

export function post_message<Res = any>(
	message: any,
	origin: string
): Promise<Res> {
	return new Promise((res, _rej) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = (({ data }) => {
			channel.port1.close();
			res(data);
		}) as (ev: MessageEvent<Res>) => void;
		window.parent.postMessage(message, origin, [channel.port2]);
	});
}

export function handle_file(
	file_or_url: File | string | Blob | Buffer
): FileData | Blob | Command {
	if (typeof file_or_url === "string") {
		if (
			file_or_url.startsWith("http://") ||
			file_or_url.startsWith("https://")
		) {
			return {
				path: file_or_url,
				url: file_or_url,
				orig_name: file_or_url.split("/").pop() ?? "unknown",
				meta: { _type: "gradio.FileData" }
			};
		}

		if (is_node) {
			// Handle local file paths
			return new Command("upload_file", {
				path: file_or_url,
				name: file_or_url,
				orig_path: file_or_url
			});
		}
	} else if (typeof File !== "undefined" && file_or_url instanceof File) {
		return new Blob([file_or_url]);
	} else if (file_or_url instanceof Buffer) {
		return new Blob([file_or_url]);
	} else if (file_or_url instanceof Blob) {
		return file_or_url;
	}
	throw new Error(
		"Invalid input: must be a URL, File, Blob, or Buffer object."
	);
}

/**
 * Handles the payload by filtering out state inputs and returning an array of resolved payload values.
 * We send null values for state inputs to the server, but we don't want to include them in the resolved payload.
 *
 * @param resolved_payload - The resolved payload values received from the client or the server
 * @param dependency - The dependency object.
 * @param components - The array of component metadata.
 * @param with_null_state - Optional. Specifies whether to include null values for state inputs. Default is false.
 * @returns An array of resolved payload values, filtered based on the dependency and component metadata.
 */
export function handle_payload(
	resolved_payload: unknown[],
	dependency: Dependency,
	components: ComponentMeta[],
	type: "input" | "output",
	with_null_state = false
): unknown[] {
	if (type === "input" && !with_null_state) {
		throw new Error("Invalid code path. Cannot skip state inputs for input.");
	}
	// data comes from the server with null state values so we skip
	if (type === "output" && with_null_state) {
		return resolved_payload;
	}

	let updated_payload: unknown[] = [];
	let payload_index = 0;
	const deps = type === "input" ? dependency.inputs : dependency.outputs;
	for (let i = 0; i < deps.length; i++) {
		const input_id = deps[i];
		const component = components.find((c) => c.id === input_id);

		if (component?.type === "state") {
			// input + with_null_state needs us to fill state with null values
			if (with_null_state) {
				if (resolved_payload.length === deps.length) {
					const value = resolved_payload[payload_index];
					updated_payload.push(value);
					payload_index++;
				} else {
					updated_payload.push(null);
				}
			} else {
				// this is output & !with_null_state, we skip state inputs
				// the server payload always comes with null state values so we move along the payload index
				payload_index++;
				continue;
			}
			// input & !with_null_state isn't a case we care about, server needs null
			continue;
		} else {
			const value = resolved_payload[payload_index];
			updated_payload.push(value);
			payload_index++;
		}
	}

	return updated_payload;
}
