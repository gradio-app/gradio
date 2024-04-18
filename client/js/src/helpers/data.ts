import { NodeBlob } from "../client";
import type {
	ApiData,
	BlobRef,
	Config,
	EndpointInfo,
	JsApiData,
	ParamType
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
	param: ParamType,
	type: string | undefined = undefined,
	path: string[] = [],
	root = false,
	endpoint_info: EndpointInfo<ApiData | JsApiData> | undefined = undefined
): Promise<BlobRef[]> {
	if (Array.isArray(param)) {
		let blob_refs: BlobRef[] = [];

		await Promise.all(
			param.map(async (item) => {
				let new_path = path.slice();
				new_path.push(item);

				const array_refs = await walk_and_store_blobs(
					param[item],
					root ? endpoint_info?.parameters[item]?.component || undefined : type,
					new_path,
					false,
					endpoint_info
				);

				blob_refs = blob_refs.concat(array_refs);
			})
		);

		return blob_refs;
	} else if (globalThis.Buffer && param instanceof globalThis.Buffer) {
		const is_image = type === "Image";
		return [
			{
				path: path,
				blob: is_image ? false : new NodeBlob([param]),
				type
			}
		];
	} else if (typeof param === "object") {
		let blob_refs: BlobRef[] = [];
		for (let key in param) {
			if (param.hasOwnProperty(key)) {
				let new_path = path.slice();
				new_path.push(key);
				blob_refs = blob_refs.concat(
					await walk_and_store_blobs(
						// @ts-ignore
						param[key],
						undefined,
						new_path,
						false,
						endpoint_info
					)
				);
			}
		}
		return blob_refs;
	}
	return [];
}

export function skip_queue(id: number, config: Config): boolean {
	return (
		!(config?.dependencies?.[id]?.queue === null
			? config.enable_queue
			: config?.dependencies?.[id]?.queue) || false
	);
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
