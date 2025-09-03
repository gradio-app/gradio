import { getWorkerProxyContext } from "./context";
import { is_self_host } from "../network/host";
import { getHeaderValue } from "../src/http";
import type { WorkerProxy } from "../src/worker-proxy";

type MediaSrc = string | undefined | null;

export function should_proxy_wasm_src(src: MediaSrc): boolean {
	const is_browser = typeof window !== "undefined";

	if (src == null || !is_browser) {
		return false;
	}

	const url = new URL(src, window.location.href);
	if (!is_self_host(url)) {
		// `src` is not accessing a local server resource, so we don't need to proxy this request to the Wasm worker.
		return false;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		// `src` can be a data URL.
		return false;
	}

	return true;
}

let maybeWorkerProxy: WorkerProxy | undefined;

export async function resolve_wasm_src(src: MediaSrc): Promise<MediaSrc> {
	const is_browser = typeof window !== "undefined";
	if (src == null || !is_browser || !should_proxy_wasm_src(src)) {
		return src;
	}

	if (maybeWorkerProxy == null) {
		try {
			maybeWorkerProxy = getWorkerProxyContext();
		} catch (e) {
			// We are not in the Wasm env. Just use the src as is.
			return src;
		}
	}

	if (maybeWorkerProxy == null) {
		// We are not in the Wasm env. Just use the src as is.
		return src;
	}

	const url = new URL(src, window.location.href);
	const path = url.pathname;
	return maybeWorkerProxy
		.httpRequest({
			method: "GET",
			path,
			headers: {},
			query_string: ""
		})
		.then((response) => {
			if (response.status !== 200) {
				throw new Error(`Failed to get file ${path} from the Wasm worker.`);
			}
			const blob = new Blob([response.body], {
				type: getHeaderValue(response.headers, "content-type")
			});
			const blobUrl = URL.createObjectURL(blob);
			return blobUrl;
		});
}
