import type { InMessage, ReplyMessage } from "./message-types";

export class WorkerProxy {
	private worker: Worker;

	constructor() {
		console.debug("WorkerProxy.constructor(): Create a new worker.");
		// Loading a worker here relies on Vite's support for WebWorkers (https://vitejs.dev/guide/features.html#web-workers),
		// assuming that this module is imported from the Gradio frontend (`@gradio/app`), which is bundled with Vite.
		this.worker = new Worker(new URL("./webworker.js", import.meta.url));
	}

	// A wrapper for this.worker.postMessage(). Unlike that function, which
	// returns void immediately, this function returns a promise, which resolves
	// when a ReplyMessage is received from the worker.
	// The original implementation is in https://github.com/rstudio/shinylive/blob/v0.1.2/src/pyodide-proxy.ts#L404-L418
	private async postMessageAsync(msg: InMessage): Promise<ReplyMessage> {
		return new Promise((onSuccess) => {
			const channel = new MessageChannel();

			channel.port1.onmessage = (e) => {
				channel.port1.close();
				const msg = e.data as ReplyMessage;
				onSuccess(msg);
			};

			this.worker.postMessage(msg, [channel.port2]);
		});
	}

	test() {
		// TODO: Remove this function!!!
		// This is just a temporary sample.
		console.log("WorkerProxy.test(): Send a test message to the worker.");
		const msg: InMessage = {
			type: "test",
			data: {
				foo: "bar"
			}
		};
		this.postMessageAsync(msg).then((reply) => {
			console.log(
				"WorkerProxy.test(): Received a reply from the worker.",
				reply
			);
		});
	}
}
