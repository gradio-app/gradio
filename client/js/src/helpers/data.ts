import { NodeBlob } from "../client";
import type {
	ApiData,
	BlobRef,
	Config,
	EndpointInfo,
	JsApiData,
	DataType,
	Dependency,
	ComponentMeta
} from "../types";

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
		const is_image = type === "Image";
		return [
			{
				path: path,
				blob: is_image ? false : new NodeBlob([data]),
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
	with_null_state = false
): any[] {
	try {
		let payload_index = 0;
		let updated_payload: unknown[] = [];

		dependency.inputs.forEach((input_id) => {
			const component = components.find((c) => c.id === input_id);
			if (component?.type === "state") {
				if (with_null_state) {
					updated_payload.push(null);
				}
				if (!with_null_state) payload_index++;
			} else {
				const value = resolved_payload[payload_index];
				updated_payload.push(value);
				payload_index++;
			}
		});

		return updated_payload;
	} catch (e) {
		console.error(e);
		return resolved_payload;
	}
}

export function build_payload(
	resolved_payload: unknown[],
	dependency: Dependency,
	components: ComponentMeta[]
): any[] {
	let updated_payload: unknown[] = [];

	dependency.inputs.map((input_id: number, index: number): any => {
		const component = components.find((c: any) => c.id === input_id);
		if (component?.type === "state") {
			return null;
		}
		updated_payload.push(resolved_payload[index]);
	});
	return updated_payload;
}
