import type { WorkerProxy } from "./worker-proxy";

export async function setupGradioLiteServiceWorker(workerProxy: WorkerProxy): Promise<void> {
	if (!("serviceWorker" in navigator)) {
		return;
	}

	// TODO: Dynamically determine the path to the service worker script.
	const serviceWorkerPath = "/sw.js";  // Depends on `viteStaticCopy` in js/app/vite.config.ts

	// Start the service worker as soon as possible, to maximize the
	// resources it will be able to cache on the first run.
	navigator.serviceWorker
		.register(serviceWorkerPath)
		.then((registration) => {
			console.debug("Service Worker registered");
			if (registration.installing) {
				console.debug("Service worker installing");
			} else if (registration.waiting) {
				console.debug("Service worker installed");
			} else if (registration.active) {
				console.debug("Service worker active");
			}

			// TODO: Will this get GC'd on subsequent calls?
			const httpRequestChannel = new MessageChannel();

			httpRequestChannel.port1.addEventListener("message", (event) => {
				const request = event.data;
				console.debug("setupGradioLiteServiceWorker.onmessage", request);

				const messagePort = event.ports[0];

				workerProxy.httpRequest(request)
					.then((response) => {
						console.debug("HTTP Response", response);
						messagePort.postMessage({
							response
						});
					})
					.catch((error) => {
						messagePort.postMessage({
							error,
						});
					});
			});
			httpRequestChannel.port1.start();

			console.debug("Register this app instance (bound to a WebWorker instance) with the service worker");
			const randomKey = Math.random().toString(36).substring(7); // TODO:
			const appId = `app_${randomKey}`;
			const serviceWorker = registration.active
			serviceWorker?.postMessage({
				type: "sw:configureHttpProxy",
				data: {
					appId,
				}
			},
				[httpRequestChannel.port2])

			// Currently there is no way to detect if a tab (and its bound message ports) from the Service Worker when it tries to communicate,
			// so we have to manually unregister the app instance when the tab is closed beforehand.
			// Ref: https://stackoverflow.com/questions/13662089/javascript-how-to-know-if-a-connection-with-a-shared-worker-is-still-alive
			// TODO: Check if this unregister mechanism properly works when there are multiple app instances (WebWorkers and bound message ports) in a single tab.
			addEventListener("beforeunload", () => {
				serviceWorker?.postMessage({
					type: "sw:unregister",
					data: {
						appId,
					}
				})
			});
		})
		.catch((err) => console.error("Service Worker registration failed", err));

	navigator.serviceWorker.ready.then((registration) => {
		if (!navigator.serviceWorker.controller) {
			// For Shift+Reload case; navigator.serviceWorker.controller will
			// never appear until a regular (not Shift+Reload) page load.
			window.location.reload();
		}
	});
}
