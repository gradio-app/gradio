import type { Config } from "./types.js";

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

export function map_names_to_ids(
	fns: Config["dependencies"]
): Record<string, number> {
	let apis: Record<string, number> = {};

	fns.forEach(({ api_name }, i) => {
		if (api_name) apis[api_name] = i;
	});

	return apis;
}

const RE_DISABLED_DISCUSSION =
	/^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
export async function discussions_enabled(space_id: string): Promise<boolean> {
	try {
		const r = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/discussions`,
			{
				method: "HEAD"
			}
		);
		const error = r.headers.get("x-error-message");

		if (error && RE_DISABLED_DISCUSSION.test(error)) return false;
		return true;
	} catch (e) {
		return false;
	}
}

export async function get_space_hardware(
	space_id: string,
	token: `hf_${string}`
): Promise<(typeof hardware_types)[number]> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const res = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/runtime`,
			{ headers }
		);

		if (res.status !== 200)
			throw new Error("Space hardware could not be obtained.");

		const { hardware } = await res.json();

		return hardware;
	} catch (e: any) {
		throw new Error(e.message);
	}
}

export async function set_space_hardware(
	space_id: string,
	new_hardware: (typeof hardware_types)[number],
	token: `hf_${string}`
): Promise<(typeof hardware_types)[number]> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const res = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/hardware`,
			{ headers, body: JSON.stringify(new_hardware) }
		);

		if (res.status !== 200)
			throw new Error(
				"Space hardware could not be set. Please ensure the space hardware provided is valid and that a Hugging Face token is passed in."
			);

		const { hardware } = await res.json();

		return hardware;
	} catch (e: any) {
		throw new Error(e.message);
	}
}

export async function set_space_timeout(
	space_id: string,
	timeout: number,
	token: `hf_${string}`
): Promise<number> {
	const headers: { Authorization?: string } = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const res = await fetch(
			`https://huggingface.co/api/spaces/${space_id}/hardware`,
			{ headers, body: JSON.stringify({ seconds: timeout }) }
		);

		if (res.status !== 200)
			throw new Error(
				"Space hardware could not be set. Please ensure the space hardware provided is valid and that a Hugging Face token is passed in."
			);

		const { hardware } = await res.json();

		return hardware;
	} catch (e: any) {
		throw new Error(e.message);
	}
}

export const hardware_types = [
	"cpu-basic",
	"cpu-upgrade",
	"t4-small",
	"t4-medium",
	"a10g-small",
	"a10g-large",
	"a100-large"
] as const;

function apply_edit(
	target: any,
	path: (number | string)[],
	action: string,
	value: any
): any {
	if (path.length === 0) {
		if (action === "replace") {
			return value;
		} else if (action === "append") {
			return target + value;
		}
		throw new Error(`Unsupported action: ${action}`);
	}

	let current = target;
	for (let i = 0; i < path.length - 1; i++) {
		current = current[path[i]];
	}

	const last_path = path[path.length - 1];
	switch (action) {
		case "replace":
			current[last_path] = value;
			break;
		case "append":
			current[last_path] += value;
			break;
		case "add":
			if (Array.isArray(current)) {
				current.splice(Number(last_path), 0, value);
			} else {
				current[last_path] = value;
			}
			break;
		case "delete":
			if (Array.isArray(current)) {
				current.splice(Number(last_path), 1);
			} else {
				delete current[last_path];
			}
			break;
		default:
			throw new Error(`Unknown action: ${action}`);
	}
	return target;
}

export function apply_diff(
	obj: any,
	diff: [string, (number | string)[], any][]
): any {
	diff.forEach(([action, path, value]) => {
		obj = apply_edit(obj, path, action, value);
	});

	return obj;
}
