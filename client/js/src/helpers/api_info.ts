import type { Status } from "../types";
import { QUEUE_FULL_MSG } from "../constants";
import type { ApiData, ApiInfo, Config, JsApiData } from "../types";
import { determine_protocol } from "./init_helpers";

export const RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/;
export const RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}$/;

export async function process_endpoint(
	app_reference: string,
	token?: `hf_${string}`
): Promise<{
	space_id: string | false;
	host: string;
	ws_protocol: "ws" | "wss";
	http_protocol: "http:" | "https:";
}> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const _app_reference = app_reference.trim();

	if (RE_SPACE_NAME.test(_app_reference)) {
		try {
			const res = await fetch(
				`https://huggingface.co/api/spaces/${_app_reference}/host`,
				{ headers }
			);

			if (res.status !== 200)
				throw new Error("Space metadata could not be loaded.");
			const _host = (await res.json()).host;

			return {
				space_id: app_reference,
				...determine_protocol(_host)
			};
		} catch (e: any) {
			throw new Error("Space metadata could not be loaded." + e.message);
		}
	}

	if (RE_SPACE_DOMAIN.test(_app_reference)) {
		const { ws_protocol, http_protocol, host } =
			determine_protocol(_app_reference);

		return {
			space_id: host.replace(".hf.space", ""),
			ws_protocol,
			http_protocol,
			host
		};
	}

	return {
		space_id: false,
		...determine_protocol(_app_reference)
	};
}

export function transform_api_info(
	api_info: ApiInfo<ApiData>,
	config: Config,
	api_map: Record<string, number>
): ApiInfo<JsApiData> {
	const new_data: any = {
		named_endpoints: {},
		unnamed_endpoints: {}
	};

	for (const category of Object.keys(api_info) as (keyof ApiInfo<ApiData>)[]) {
		const endpoints = api_info[category];
		new_data[category] = {};

		for (const endpoint in endpoints) {
			const { parameters, returns } = endpoints[endpoint];
			const dependencyIndex =
				config.dependencies.findIndex((dep) => dep.api_name === endpoint) ||
				api_map[endpoint.replace("/", "")] ||
				-1;
			const dependencyTypes =
				dependencyIndex !== -1
					? config.dependencies[dependencyIndex].types
					: { continuous: false, generator: false };

			new_data[category][endpoint] = {
				parameters: parameters.map((p) => ({
					...p,
					type: get_type(p.type, p.component, p.serializer, "parameter"),
					description: get_description(p.type, p.serializer)
				})),
				returns: returns.map((r) => ({
					...r,
					type: get_type(r.type, r.component, r.serializer, "return"),
					description: get_description(r.type, r.serializer)
				})),
				type: dependencyTypes
			};
		}
	}

	return new_data;
}

export function get_type(
	type: { [key: string]: any },
	component: string,
	serializer: string,
	signature_type: "return" | "parameter"
): string | undefined {
	switch (type.type) {
		case "string":
			return "string";
		case "boolean":
			return "boolean";
		case "number":
			return "number";
	}

	if (
		serializer === "JSONSerializable" ||
		serializer === "StringSerializable"
	) {
		return "any";
	} else if (serializer === "ListStringSerializable") {
		return "string[]";
	} else if (component === "Image") {
		return signature_type === "parameter" ? "Blob | File | Buffer" : "string";
	} else if (serializer === "FileSerializable") {
		if (type?.type === "array") {
			return signature_type === "parameter"
				? "(Blob | File | Buffer)[]"
				: `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]`;
		}
		return signature_type === "parameter"
			? "Blob | File | Buffer"
			: `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}`;
	} else if (serializer === "GallerySerializable") {
		return signature_type === "parameter"
			? "[(Blob | File | Buffer), (string | null)][]"
			: `[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]`;
	}
}

export function get_description(
	type: { type: any; description: string },
	serializer: string
): string {
	if (serializer === "GallerySerializable") {
		return "array of [file, label] tuples";
	} else if (serializer === "ListStringSerializable") {
		return "array of strings";
	} else if (serializer === "FileSerializable") {
		return "array of files or single file";
	}
	return type.description;
}

export function handle_message(
	data: any,
	last_status: Status["stage"]
): {
	type:
		| "hash"
		| "data"
		| "update"
		| "complete"
		| "generating"
		| "log"
		| "none"
		| "heartbeat"
		| "unexpected_error";
	data?: any;
	status?: Status;
} {
	const queue = true;
	switch (data.msg) {
		case "send_data":
			return { type: "data" };
		case "send_hash":
			return { type: "hash" };
		case "queue_full":
			return {
				type: "update",
				status: {
					queue,
					message: QUEUE_FULL_MSG,
					stage: "error",
					code: data.code,
					success: data.success
				}
			};
		case "heartbeat":
			return {
				type: "heartbeat"
			};
		case "unexpected_error":
			return {
				type: "unexpected_error",
				status: {
					queue,
					message: data.message,
					stage: "error",
					success: false
				}
			};
		case "estimation":
			return {
				type: "update",
				status: {
					queue,
					stage: last_status || "pending",
					code: data.code,
					size: data.queue_size,
					position: data.rank,
					eta: data.rank_eta,
					success: data.success
				}
			};
		case "progress":
			return {
				type: "update",
				status: {
					queue,
					stage: "pending",
					code: data.code,
					progress_data: data.progress_data,
					success: data.success
				}
			};
		case "log":
			return { type: "log", data: data };
		case "process_generating":
			return {
				type: "generating",
				status: {
					queue,
					message: !data.success ? data.output.error : null,
					stage: data.success ? "generating" : "error",
					code: data.code,
					progress_data: data.progress_data,
					eta: data.average_duration
				},
				data: data.success ? data.output : null
			};
		case "process_completed":
			if ("error" in data.output) {
				return {
					type: "update",
					status: {
						queue,
						message: data.output.error as string,
						stage: "error",
						code: data.code,
						success: data.success
					}
				};
			}
			return {
				type: "complete",
				status: {
					queue,
					message: !data.success ? data.output.error : undefined,
					stage: data.success ? "complete" : "error",
					code: data.code,
					progress_data: data.progress_data
				},
				data: data.success ? data.output : null
			};

		case "process_starts":
			return {
				type: "update",
				status: {
					queue,
					stage: "pending",
					code: data.code,
					size: data.rank,
					position: 0,
					success: data.success,
					eta: data.eta
				}
			};
	}

	return { type: "none", status: { stage: "error", queue } };
}
