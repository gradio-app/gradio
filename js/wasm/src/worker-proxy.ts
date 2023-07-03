import { CrossOriginWorkerMaker as Worker } from "./cross-origin-worker";
import type {
	HttpRequest,
	HttpResponse,
	InMessage,
	ReplyMessage
} from "./message-types";

export interface WorkerProxyOptions {
	gradioWheelUrl: string;
	gradioClientWheelUrl: string;
	requirements: string[];
}

export class WorkerProxy {
	private worker: globalThis.Worker;

	constructor(options: WorkerProxyOptions) {
		console.debug("WorkerProxy.constructor(): Create a new worker.");
		// Loading a worker here relies on Vite's support for WebWorkers (https://vitejs.dev/guide/features.html#web-workers),
		// assuming that this module is imported from the Gradio frontend (`@gradio/app`), which is bundled with Vite.
		// HACK: Use `CrossOriginWorkerMaker` imported as `Worker` here.
		// Read the comment in `cross-origin-worker.ts` for the detail.
		const workerMaker = new Worker(new URL("./webworker.js", import.meta.url));
		this.worker = workerMaker.worker;

		this.postMessageAsync({
			type: "init",
			data: {
				gradioWheelUrl: options.gradioWheelUrl,
				gradioClientWheelUrl: options.gradioClientWheelUrl,
				requirements: options.requirements
			}
		}).then(() => {
			console.debug("WorkerProxy.constructor(): Initialization is done.");
		});
	}

	public async runPythonAsync(code: string): Promise<void> {
		await this.postMessageAsync({
			type: "run-python",
			data: {
				code
			}
		});
	}

	// A wrapper for this.worker.postMessage(). Unlike that function, which
	// returns void immediately, this function returns a promise, which resolves
	// when a ReplyMessage is received from the worker.
	// The original implementation is in https://github.com/rstudio/shinylive/blob/v0.1.2/src/pyodide-proxy.ts#L404-L418
	private postMessageAsync(msg: InMessage): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const channel = new MessageChannel();

			channel.port1.onmessage = (e) => {
				channel.port1.close();
				const msg = e.data as ReplyMessage;
				if (msg.type === "reply:error") {
					reject(msg.error);
					return;
				}

				resolve(msg.data);
			};

			this.worker.postMessage(msg, [channel.port2]);
		});
	}

	public async httpRequest(request: HttpRequest): Promise<HttpResponse> {
		console.debug("WorkerProxy.httpRequest()", request);
		const result = await this.postMessageAsync({
			type: "http-request",
			data: {
				request
			}
		});
		const response = (result as { response: HttpResponse }).response;

		if (Math.floor(response.status / 100) !== 2) {
			let bodyText: string;
			let bodyJson: unknown;
			try {
				bodyText = new TextDecoder().decode(response.body);
			} catch (e) {
				bodyText = "(failed to decode body)";
			}
			try {
				bodyJson = JSON.parse(bodyText);
			} catch (e) {
				bodyJson = "(failed to parse body as JSON)";
			}
			console.error("Wasm HTTP error", {
				request,
				response,
				bodyText,
				bodyJson
			});
		}

		return response;
	}

	public terminate(): void {
		this.worker.terminate();
	}
}
