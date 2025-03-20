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

// Caching is important not only for performance but also for ensuring that the same blob URL is used for the same requested URL.
const worker_blob_url_cache = new Map<string, string>();
function get_blob_url(url: URL): string {
	const cached_worker_blob_url = worker_blob_url_cache.get(url.toString());
	if (cached_worker_blob_url) {
		console.debug(`Reusing the cached worker blob URL for ${url.toString()}.`);
		return cached_worker_blob_url;
	}

	const worker_blob = new Blob([`importScripts("${url.toString()}");`], {
		type: "text/javascript"
	});
	const worker_blob_url = URL.createObjectURL(worker_blob);
	worker_blob_url_cache.set(url.toString(), worker_blob_url);
	return worker_blob_url;
}

function is_same_origin(url: URL): boolean {
	return url.origin === window.location.origin;
}

function createWorker(
	url: URL | string,
	shared: boolean,
	workerOptions: WorkerOptions
): Worker | SharedWorker {
	if (shared) {
		if (typeof window.SharedWorker !== "undefined") {
			return new SharedWorker(url, workerOptions);
		}
		// e.g. Chrome for Android
		console.warn(
			"SharedWorker is not supported in this browser. Use the regular Worker instead."
		);
		return new Worker(url, workerOptions);
	}
	return new Worker(url, workerOptions);
}

export class CrossOriginWorkerMaker {
	public readonly worker: Worker | SharedWorker;

	constructor(url: URL, options?: WorkerOptions & { shared?: boolean }) {
		const { shared = false, ...workerOptions } = options ?? {};

		if (is_same_origin(url)) {
			console.debug(
				`Loading a worker script from the same origin: ${url.toString()}.`
			);
			// This is the normal way to load a worker script, which is the best straightforward if possible.
			this.worker = createWorker(url, shared, workerOptions);

			// NOTE: We use here `if-else` checking the origin instead of `try-catch`
			// because the `try-catch` approach doesn't work on some browsers like FireFox.
			// In the cross-origin case, FireFox throws a SecurityError asynchronously after the worker is created,
			// so we can't catch the error synchronously.
		} else {
			console.debug(
				`Loading a worker script from a different origin: ${url.toString()}.`
			);
			const worker_blob_url = get_blob_url(url);
			this.worker = createWorker(worker_blob_url, shared, workerOptions);
		}
	}
}
