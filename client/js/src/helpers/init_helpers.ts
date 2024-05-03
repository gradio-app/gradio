import type { Config } from "../types";
import { CONFIG_ERROR_MSG, CONFIG_URL } from "../constants";
import { Client } from "..";

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
		return false;
	}
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

export async function resolve_config(
	this: Client,
	endpoint: string
): Promise<Config | undefined> {
	const headers: Record<string, string> = this.options.hf_token
		? { Authorization: `Bearer ${this.options.hf_token}` }
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
		let config_root = resolve_root(endpoint, config.root, false);
		config.root = config_root;
		return { ...config, path } as Config;
	} else if (endpoint) {
		const response = await this.fetch(`${endpoint}/${CONFIG_URL}`, {
			headers
		});

		if (response?.status === 200) {
			let config = await response.json();
			config.path = config.path ?? "";
			config.root = endpoint;
			return config;
		}
		throw new Error(CONFIG_ERROR_MSG);
	}

	throw new Error(CONFIG_ERROR_MSG);
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
