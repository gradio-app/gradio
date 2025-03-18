import type { Config } from "../types";
import {
	CONFIG_ERROR_MSG,
	CONFIG_URL,
	INVALID_CREDENTIALS_MSG,
	LOGIN_URL,
	MISSING_CREDENTIALS_MSG,
	SPACE_METADATA_ERROR_MSG,
	UNAUTHORIZED_MSG
} from "../constants";
import { Client } from "..";
import { join_urls, process_endpoint } from "./api_info";

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
	token: `hf_${string}`,
	cookies?: string | null
): Promise<string | false> {
	try {
		const r = await fetch(`https://huggingface.co/api/spaces/${space}/jwt`, {
			headers: {
				Authorization: `Bearer ${token}`,
				...(cookies ? { Cookie: cookies } : {})
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

	fns.forEach(({ api_name, id }) => {
		if (api_name) apis[api_name] = id;
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
		let config_url = join_urls(
			endpoint,
			this.deep_link ? CONFIG_URL + "?deep_link=" + this.deep_link : CONFIG_URL
		);

		const response = await this.fetch(config_url, {
			headers,
			credentials: "include"
		});

		if (response?.status === 401 && !this.options.auth) {
			throw new Error(MISSING_CREDENTIALS_MSG);
		} else if (response?.status === 401 && this.options.auth) {
			throw new Error(INVALID_CREDENTIALS_MSG);
		}
		if (response?.status === 200) {
			let config = await response.json();
			config.path = config.path ?? "";
			config.root = endpoint;
			config.dependencies?.forEach((dep: any, i: number) => {
				if (dep.id === undefined) {
					dep.id = i;
				}
			});
			return config;
		} else if (response?.status === 401) {
			throw new Error(UNAUTHORIZED_MSG);
		}
		throw new Error(CONFIG_ERROR_MSG);
	}

	throw new Error(CONFIG_ERROR_MSG);
}

export async function resolve_cookies(this: Client): Promise<void> {
	const { http_protocol, host } = await process_endpoint(
		this.app_reference,
		this.options.hf_token
	);

	try {
		if (this.options.auth) {
			const cookie_header = await get_cookie_header(
				http_protocol,
				host,
				this.options.auth,
				this.fetch,
				this.options.hf_token
			);

			if (cookie_header) this.set_cookies(cookie_header);
		}
	} catch (e: unknown) {
		throw Error((e as Error).message);
	}
}

// separating this from client-bound resolve_cookies so that it can be used in duplicate
export async function get_cookie_header(
	http_protocol: string,
	host: string,
	auth: [string, string],
	_fetch: typeof fetch,
	hf_token?: `hf_${string}`
): Promise<string | null> {
	const formData = new FormData();
	formData.append("username", auth?.[0]);
	formData.append("password", auth?.[1]);

	let headers: { Authorization?: string } = {};

	if (hf_token) {
		headers.Authorization = `Bearer ${hf_token}`;
	}

	const res = await _fetch(`${http_protocol}//${host}/${LOGIN_URL}`, {
		headers,
		method: "POST",
		body: formData,
		credentials: "include"
	});

	if (res.status === 200) {
		return res.headers.get("set-cookie");
	} else if (res.status === 401) {
		throw new Error(INVALID_CREDENTIALS_MSG);
	} else {
		throw new Error(SPACE_METADATA_ERROR_MSG);
	}
}

export function determine_protocol(endpoint: string): {
	ws_protocol: "ws" | "wss";
	http_protocol: "http:" | "https:";
	host: string;
} {
	if (endpoint.startsWith("http")) {
		const { protocol, host, pathname } = new URL(endpoint);

		return {
			ws_protocol: protocol === "https:" ? "wss" : "ws",
			http_protocol: protocol as "http:" | "https:",
			host: host + (pathname !== "/" ? pathname : "")
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
		host: new URL(endpoint).host
	};
}

export const parse_and_set_cookies = (cookie_header: string): string[] => {
	let cookies: string[] = [];
	const parts = cookie_header.split(/,(?=\s*[^\s=;]+=[^\s=;]+)/);
	parts.forEach((cookie) => {
		const [cookie_name, cookie_value] = cookie.split(";")[0].split("=");
		if (cookie_name && cookie_value) {
			cookies.push(`${cookie_name.trim()}=${cookie_value.trim()}`);
		}
	});
	return cookies;
};
