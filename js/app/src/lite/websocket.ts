import type { WorkerProxy } from "@gradio/wasm";
import { is_self_host } from "@gradio/wasm/network";

/**
 * A WebSocket factory that proxies requests to the worker,
 * which also falls back to the original WebSocket() for external resource requests.
 */

export function wasm_proxied_WebSocket_factory(
	worker_proxy: WorkerProxy,
	url: URL
): WebSocket {
	if (!is_self_host(url)) {
		console.debug("Fallback to original WebSocket");
		return new WebSocket(url);
	}

	return worker_proxy.openWebSocket(url.pathname) as unknown as WebSocket;
}
