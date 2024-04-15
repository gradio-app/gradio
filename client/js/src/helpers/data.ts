import { NodeBlob } from "../client";
import type {
	ApiData,
	BlobRef,
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

export async function get_jwt(
	space: string,
	token: `hf_${string}`
): Promise<string | false> {
	try {
		const r = await fetch(`https://huggingface.co/api/spaces/${space}/jwt`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const jwt = (await r.json()).token;

		return jwt || false;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export async function walk_and_store_blobs(
	param: ParamType,
	type: string | undefined = undefined,
	path: string[] = [],
	root = false,
	api_info: EndpointInfo<ApiData | JsApiData> | undefined = undefined
): Promise<BlobRef[]> {
	if (Array.isArray(param)) {
		let blob_refs: BlobRef[] = [];

		await Promise.all(
			param.map(async (item, index) => {
				let new_path = path.slice();
				new_path.push(item);

				const array_refs = await walk_and_store_blobs(
					param[item],
					root ? api_info?.parameters[item]?.component || undefined : type,
					new_path,
					false,
					api_info
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
						api_info
					)
				);
			}
		}
		return blob_refs;
	}
	return [];
}
