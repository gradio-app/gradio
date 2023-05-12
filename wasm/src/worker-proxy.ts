import type { InMessage, ReplyMessage } from "./message-types";

export interface WorkerProxyOptions {
	gradioWheelUrl: string;
	gradioClientWheelUrl: string;
	requirements: string[];
}

export class WorkerProxy {
	private worker: Worker;

	constructor(options: WorkerProxyOptions) {
		console.debug("WorkerProxy.constructor(): Create a new worker.");
		// Loading a worker here relies on Vite's support for WebWorkers (https://vitejs.dev/guide/features.html#web-workers),
		// assuming that this module is imported from the Gradio frontend (`@gradio/app`), which is bundled with Vite.
		this.worker = new Worker(new URL("./webworker.js", import.meta.url));

		this.postMessageAsync({
			type: "init",
			data: {
				gradioWheelUrl: options.gradioWheelUrl,
				gradioClientWheelUrl: options.gradioClientWheelUrl,
				requirements: options.requirements
			}
		}).then(() => {
			console.debug("WorkerProxy.constructor(): Initialization is done.");

			// TODO: Remove this debug code
			this.runPythonAsync(`40 + 2`).then((result) => {
				console.log("WorkerProxy.constructor(): 40 + 2 =", result);
			});
		});
	}

	public async runPythonAsync(code: string): Promise<unknown> {
		return this.postMessageAsync({
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
}
