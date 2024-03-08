import { NodeBlob } from "../client";
import { ApiData, BlobRef, EndpointInfo, JsApiData, ParamType } from "../types";

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
	endpoint_info: EndpointInfo<ApiData | JsApiData>
): Promise<BlobRef[]> {
	if (Array.isArray(param)) {
		const blobRefs: BlobRef[] = [];

		await Promise.all(
			param.map(async (item, index) => {
				const newPath = [...path, index.toString()];
				const arrayRefs = await walk_and_store_blobs(
					item,
					root ? endpoint_info.parameters[index]?.component : type,
					newPath,
					false,
					endpoint_info
				);
				blobRefs.push(...arrayRefs);
			})
		);

		return blobRefs;
	} else if (globalThis.Buffer && param instanceof globalThis.Buffer) {
		return [
			{
				path,
				type,
				blob: type === "Image" ? false : new NodeBlob([param])
			}
		];
	} else if (param && typeof param === "object") {
		const recordParam = param as Record<string, any>;
		const blobRefs: BlobRef[] = [];
		for (const key of Object.keys(recordParam)) {
			const newPath = [...path, key];
			const refs = await walk_and_store_blobs(
				recordParam[key],
				undefined,
				newPath,
				false,
				endpoint_info
			);
			blobRefs.push(...refs);
		}
		return blobRefs;
	}
	return [];
}
