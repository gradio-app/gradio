import { type WorkerProxy, WasmWorkerEventSource } from "@gradio/wasm";
import { is_self_host } from "@gradio/wasm/network";

/**
 * A WebSocket factory that proxies requests to the worker,
 * which also falls back to the original WebSocket() for external resource requests.
 */

export function wasm_proxied_stream_factory(
	worker_proxy: WorkerProxy,
	url: URL
): EventSource {
	if (!is_self_host(url)) {
		console.debug("Fallback to original WebSocket");
		return new EventSource(url);
	}

	return new WasmWorkerEventSource(worker_proxy, url) as unknown as EventSource;
}
