// A hack to load a worker script from a different origin.
// Vite's built-in Web Workers feature does not support inlining the worker code
// into the main bundle and always emits it to a separate file,
// which is not compatible with the cross-origin worker.
// So we use this hack to load the separate worker code from a domain different from the parent page.
// Vite deals with the special syntax `new Worker(new URL("worker.ts", import.meta.url))` for the worker build,
// so this `CrossOriginWorkerMaker` class must be defined in a separate file and
// be imported as the `Worker` alias into the file where the syntax is used to load the worker.
// This implementation was based on https://github.com/whitphx/stlite/blob/v0.34.0/packages/kernel/src/kernel.ts,
// and this technique was introduced originally for Webpack at https://github.com/webpack/webpack/discussions/14648#discussioncomment-1589272
export class CrossOriginWorkerMaker {
	public readonly worker: Worker | SharedWorker;

	constructor(url: URL, options?: WorkerOptions & { shared?: boolean }) {
		const { shared = false, ...workerOptions } = options ?? {};

		try {
			// This is the normal way to load a worker script, which is the best straightforward if possible.
			this.worker = shared
				? new SharedWorker(url, workerOptions)
				: new Worker(url, workerOptions);
		} catch (e) {
			console.debug(
				`Failed to load a worker script from ${url.toString()}. Trying to load a cross-origin worker...`
			);
			const workerBlob = new Blob([`importScripts("${url.toString()}");`], {
				type: "text/javascript"
			});
			const workerBlobUrl = URL.createObjectURL(workerBlob);
			this.worker = shared
				? new SharedWorker(workerBlobUrl, workerOptions)
				: new Worker(workerBlobUrl, workerOptions);
			URL.revokeObjectURL(workerBlobUrl);
		}
	}
}
