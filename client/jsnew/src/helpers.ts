import { QUEUE_FULL_MSG } from "./constants";
import { Config, ApiInfo, ApiData, Status } from "./types";

export async function resolve_config(
	fetch_implementation: typeof fetch,
	endpoint: string,
	token?: `hf_${string}`
): Promise<Config | undefined> {
	try {
		const headers: Record<string, string> = token
			? { Authorization: `Bearer ${token}` }
			: {};

		headers["Content-Type"] = "application/json";

		if (
			typeof window !== "undefined" &&
			window.gradio_config &&
			location.origin !== "http://localhost:9876" &&
			!window.gradio_config.dev_mode
		) {
			const path = window.gradio_config.root;
			const config = window.gradio_config;
			config.root = resolve_root(endpoint, config.root, false);
			return { ...config, path };
		}

		if (endpoint) {
			const response = await fetch_implementation(`${endpoint}/config`, {
				headers
			});

			if (response.status === 200) {
				let config = await response.json();
				return { ...config, path: config.path ?? "", root: endpoint };
			}
		}
	} catch (e) {
		throw new Error("Could not get config. " + (e as Error).message);
	}
}

export function resolve_root(
	base_url: string,
	root_path: string,
	prioritize_base: boolean
): string {
	if (root_path.startsWith("http://") || root_path.startsWith("https://")) {
		return prioritize_base ? base_url : root_path;
	}
	return base_url + root_path;
}

export function determine_protocol(endpoint: string): {
	http_protocol: "http:" | "https:";
	host: string;
} {
	if (endpoint.startsWith("http")) {
		const { protocol, host } = new URL(endpoint);

		return { http_protocol: protocol as "http:" | "https:", host };
	} else if (endpoint.startsWith("file:")) {
		// This case is only expected to be used for the Wasm mode (Gradio-lite),
		// where users can create a local HTML file using it and open the page in a browser directly via the `file:` protocol.
		return { http_protocol: "http:", host: "lite.local" };
	}
	return { http_protocol: "https:", host: endpoint };
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

export const RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/;
export const RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}$/;

export async function process_endpoint(
	app_reference: string,
	token?: `hf_${string}`
): Promise<{
	space_id: string | false;
	host: string;
	http_protocol: "http:" | "https:";
}> {
	const headers: Record<string, string> = token
		? { Authorization: `Bearer ${token}` }
		: {};
	const _app_reference = app_reference.trim();

	if (RE_SPACE_NAME.test(_app_reference)) {
		try {
			const res = await fetch(
				`https://huggingface.co/api/spaces/${_app_reference}/host`,
				{ headers }
			);

			if (res.status !== 200) {
				throw new Error(res.statusText);
			}

			const _host = (await res.json()).host;

			return {
				space_id: app_reference,
				...determine_protocol(_host)
			};
		} catch (e: unknown) {
			throw new Error(
				"Space metadata could not be loaded. " + (e as Error).message
			);
		}
	}

	if (RE_SPACE_DOMAIN.test(_app_reference)) {
		const { http_protocol, host } = determine_protocol(_app_reference);

		return {
			space_id: host.replace(".hf.space", ""),
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
	api_info: ApiInfo<ApiData> | { api: ApiInfo<ApiData> },
	config: Config,
	api_map: Record<string, number>
): ApiInfo<ApiData> {
	let new_data: Record<string, any> = {
		named_endpoints: {},
		unnamed_endpoints: {}
	};

	const updated_api_info = "api" in api_info ? api_info.api : api_info;

	(["named_endpoints", "unnamed_endpoints"] as const).forEach(
		(endpoint_category) => {
			new_data[endpoint_category] = {};

			for (const endpoint in updated_api_info[endpoint_category]) {
				const dependency = config.dependencies.find(
					(dep) => dep.api_name === endpoint
				);

				const dep_index = dependency
					? endpoint
					: api_map[endpoint.replace("/", "")];

				const info = updated_api_info[endpoint_category][endpoint];

				const parameters = info.parameters.map(
					({ label, component, type, serializer }: ApiData) => ({
						label,
						component,
						type: get_type(type, component, serializer, "parameter"),
						description: get_description(type, serializer)
					})
				);

				const returns = info.returns.map(
					({ label, component, type, serializer }: ApiData) => ({
						label,
						component,
						type: get_type(type, component, serializer, "return"),
						description: get_description(type, serializer)
					})
				);

				let temp_index =
					typeof dep_index === "string" ? api_map[dep_index] : dep_index;

				new_data[endpoint_category][endpoint] = {
					parameters: parameters,
					returns: returns,
					type: config.dependencies[temp_index]?.types
				};
			}
		}
	);

	return new_data as ApiInfo<ApiData>;
}
export function map_names_to_ids(
	fns: Config["dependencies"]
): Record<string, number> {
	let apis: Record<string, number> = {};

	fns.forEach(({ api_name }, i: number) => {
		if (api_name) apis[api_name] = i;
	});
	return apis;
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

export function skip_queue(id: number, config: Config): boolean {
	return (
		!(config?.dependencies?.[id]?.queue === null
			? config.enable_queue
			: config?.dependencies?.[id]?.queue) || false
	);
}
