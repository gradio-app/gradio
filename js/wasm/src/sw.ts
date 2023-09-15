/// <reference lib="WebWorker" />
import { HttpRequest } from "./message-types"

async function convertHttpRequest(request: Request): Promise<HttpRequest> {
	const url = new URL(request.url);

	const method = request.method;
	if (
		method !== "GET" &&
		method !== "POST" &&
		method !== "PUT" &&
		method !== "DELETE"
	) {
		throw new Error(`Unsupported method: ${method}`);
	}

	const headers: HttpRequest["headers"] = {};
	request.headers.forEach((value, key) => {
		headers[key] = value;
	});

	const bodyArrayBuffer = await new Response(request.body).arrayBuffer();
	const body: HttpRequest["body"] =
		new Uint8Array(bodyArrayBuffer);

	return {
		method,
		headers,
		path: url.pathname,
		query_string: url.search,
		body,
	}
}

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
	// The promise that skipWaiting() returns can be safely ignored.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
	event.waitUntil(self.clients.claim());
});

const httpRequestPorts: Record<string, MessagePort> = {};

const PROXY_PATH_PREFIX = "/file=";

self.addEventListener("fetch", function (event): void {
	const request = event.request;
	const url = new URL(request.url);

	// Don't try to handle requests that go to other hosts.
	if (
		url.origin !== self.location.origin &&
		url.origin !== "http://localhost:7860" // Ref: https://github.com/gradio-app/gradio/blob/v3.32.0/js/app/src/Index.svelte#L194
	) {
		return;
	}

	if (!url.pathname.startsWith(PROXY_PATH_PREFIX)) {
		return;
	}

	event.respondWith(
		new Promise((resolve, reject) => {
			Object.entries(httpRequestPorts).forEach(async ([appId, httpRequestPort]) => {
				console.debug("Try to access the app", appId, httpRequestPort, url);
				const httpResponseChannel = new MessageChannel();

				const httpRequest = await convertHttpRequest(request)
				httpRequestPort.postMessage(httpRequest, [httpResponseChannel.port2]);

				httpResponseChannel.port1.start();
				httpResponseChannel.port1.addEventListener("message", (event) => {
					console.debug(`Response from ${appId}`, event.data);

					const { response, error } = event.data;
					if (error) {
						reject(error);
					} else if (response) {
						resolve(new Response(response.body, { status: response.status, headers: response.headers }));
					} else {
						reject(new Error("Unexpected response"));
					}
				});
			});
		})
	);
});

self.addEventListener("message", (event) => {
	const msg = event.data;
	if (msg.type === "sw:configureHttpProxy") {
		const { appId } = msg.data;
		const port = event.ports[0];
		console.debug("Configure the HTTP proxy", appId, port);
		httpRequestPorts[appId] = port;
	} else if (msg.type === "sw:unregister") {
		const { appId } = msg.data;
		delete httpRequestPorts[appId];
		console.debug("Unregister the HTTP proxy", appId);
	}
});
