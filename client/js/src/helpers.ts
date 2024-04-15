import { CONFIG_URL, QUEUE_FULL_MSG } from "./constants";
import type { Config, ApiInfo, ApiData, Status, JsApiData } from "./types";

export async function resolve_config(
	fetch_implementation: typeof fetch = fetch,
	endpoint: string,
	token?: `hf_${string}`
): Promise<Config | undefined> {
	const headers: Record<string, string> = token
		? { Authorization: `Bearer ${token}` }
		: {};

	// headers["Content-Type"] = "application/json";

	if (
		typeof window !== "undefined" &&
		window.gradio_config &&
		location.origin !== "http://localhost:9876" &&
		!window.gradio_config.dev_mode
	) {
		const path = window.gradio_config.root;
		const config = window.gradio_config;
		let config_root = resolve_root(endpoint, config.root, false);
		config.root = config_root;
		// @ts-ignore
		return { ...config, path };
	} else if (endpoint) {
		const response = await fetch_implementation(`${endpoint}/${CONFIG_URL}`, {
			headers
		});

		if (response?.status === 200) {
			let config = await response.json();
			config.path = config.path ?? "";
			config.root = endpoint;
			return config;
		}
		throw new Error("Could not get config.");
	}

	throw new Error("No config or app endpoint found");
}

/**
 * This function is used to resolve the URL for making requests when the app has a root path.
 * The root path could be a path suffix like "/app" which is appended to the end of the base URL. Or
 * it could be a full URL like "https://abidlabs-test-client-replica--gqf2x.hf.space" which is used when hosting
 * Gradio apps on Hugging Face Spaces.
 * @param {string} base_url The base URL at which the Gradio server is hosted
 * @param {string} root_path The root path, which could be a path suffix (e.g. mounted in FastAPI app) or a full URL (e.g. hosted on Hugging Face Spaces)
 * @param {boolean} prioritize_base Whether to prioritize the base URL over the root path. This is used when both the base path and root paths are full URLs. For example, for fetching files the root path should be prioritized, but for making requests, the base URL should be prioritized.
 * @returns {string} the resolved URL
 */
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
	ws_protocol: "ws" | "wss";
	http_protocol: "http:" | "https:";
	host: string;
} {
	if (endpoint.startsWith("http")) {
		const { protocol, host } = new URL(endpoint);

		if (host.endsWith("hf.space")) {
			return {
				ws_protocol: "wss",
				host: host,
				http_protocol: protocol as "http:" | "https:"
			};
		}
		return {
			ws_protocol: protocol === "https:" ? "wss" : "ws",
			http_protocol: protocol as "http:" | "https:",
			host
		};
	} else if (endpoint.startsWith("file:")) {
		// This case is only expected to be used for the Wasm mode (Gradio-lite),
		// where users can create a local HTML file using it and open the page in a browser directly via the `file:` protocol.
		return {
			ws_protocol: "ws",
			http_protocol: "http:",
			host: "lite.local" // Special fake hostname only used for this case. This matches the hostname allowed in `is_self_host()` in `js/wasm/network/host.ts`.
		};
	}

	// default to secure if no protocol is provided
	return {
		ws_protocol: "wss",
		http_protocol: "https:",
		host: endpoint
	};
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
