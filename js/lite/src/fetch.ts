import type { WorkerProxy } from "@gradio/wasm";
import { is_self_host } from "@gradio/wasm/network";

/**
 * A fetch() function that proxies HTTP requests to the worker,
 * which also falls back to the original fetch() for external resource requests.
 */

/**
 *
 * @param { WorkerProxy } workerProxy The worker proxy
 * @param { RequestInfo | URL} input The request info
 * @param {RequestInit} init The request init
 * @returns {Promise<Response>} The response
 */
export async function wasm_proxied_fetch(
	workerProxy: WorkerProxy,
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<Response> {
	console.debug("wasm_proxied_fetch", input, init);

	const request = new Request(input, init);

	const url = new URL(request.url);

	if (!is_self_host(url)) {
		console.debug("Fallback to original fetch");
		return fetch(input, init);
	}

	const method = request.method;
	if (
		method !== "GET" &&
		method !== "POST" &&
		method !== "PUT" &&
		method !== "DELETE"
	) {
		throw new Error(`Unsupported method: ${method}`);
	}

	const headers: Parameters<WorkerProxy["httpRequest"]>[0]["headers"] = {};
	request.headers.forEach((value, key) => {
		headers[key] = value;
	});

	const response = await workerProxy.httpRequest({
		path: url.pathname,
		query_string: url.searchParams.toString(), // The `query_string` field in the ASGI spec must not contain the leading `?`.
		method,
		headers,
		body: request.body
	});
	return new Response(response.body, {
		status: response.status,
		headers: new Headers(response.headers)
	});
}
