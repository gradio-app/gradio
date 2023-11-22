import { CrossOriginWorkerMaker as Worker } from "./cross-origin-worker";
import type {
	EmscriptenFile,
	EmscriptenFileUrl,
	HttpRequest,
	HttpResponse,
	InMessage,
	InMessageWebSocket,
	OutMessage,
	ReplyMessage
} from "./message-types";
import { MessagePortWebSocket } from "./messageportwebsocket";
import { PromiseDelegate } from "./promise-delegate";

export interface WorkerProxyOptions {
	gradioWheelUrl: string;
	gradioClientWheelUrl: string;
	files: Record<string, EmscriptenFile | EmscriptenFileUrl>;
	requirements: string[];
	sharedWorkerMode: boolean;
}

export class WorkerProxy extends EventTarget {
	private worker: globalThis.Worker | globalThis.SharedWorker;
	private postMessageTarget: globalThis.Worker | MessagePort;

	private firstRunPromiseDelegate = new PromiseDelegate<void>();

	constructor(options: WorkerProxyOptions) {
		super();

		const sharedWorkerMode = options.sharedWorkerMode;

		console.debug("WorkerProxy.constructor(): Create a new worker.");
		// Loading a worker here relies on Vite's support for WebWorkers (https://vitejs.dev/guide/features.html#web-workers),
		// assuming that this module is imported from the Gradio frontend (`@gradio/app`), which is bundled with Vite.
		// HACK: Use `CrossOriginWorkerMaker` imported as `Worker` here.
		// Read the comment in `cross-origin-worker.ts` for the detail.
		const workerMaker = new Worker(new URL("./webworker.js", import.meta.url), {
			/* @vite-ignore */ shared: sharedWorkerMode // `@vite-ignore` is needed to avoid an error `Vite is unable to parse the worker options as the value is not static.`
		});

		this.worker = workerMaker.worker;
		if (sharedWorkerMode) {
			this.postMessageTarget = (this.worker as SharedWorker).port;
			this.postMessageTarget.start();
			this.postMessageTarget.onmessage = (e) => {
				this._processWorkerMessage(e.data);
			};
		} else {
			this.postMessageTarget = this.worker as globalThis.Worker;

			(this.worker as globalThis.Worker).onmessage = (e) => {
				this._processWorkerMessage(e.data);
			};
		}

		this.postMessageAsync({
			type: "init-env",
			data: {
				gradioWheelUrl: options.gradioWheelUrl,
				gradioClientWheelUrl: options.gradioClientWheelUrl
			}
		})
			.then(() => {
				console.debug(
					"WorkerProxy.constructor(): Environment initialization is done."
				);
			})
			.catch((error) => {
				console.error(
					"WorkerProxy.constructor(): Initialization failed.",
					error
				);
				this.dispatchEvent(
					new CustomEvent("initialization-error", {
						detail: error
					})
				);
			});

		this.postMessageAsync({
			type: "init-app",
			data: {
				files: options.files,
				requirements: options.requirements
			}
		})
			.then(() => {
				console.debug("WorkerProxy.constructor(): App initialization is done.");
			})
			.catch((error) => {
				console.error(
					"WorkerProxy.constructor(): Initialization failed.",
					error
				);
				this.dispatchEvent(
					new CustomEvent("initialization-error", {
						detail: error
					})
				);
			});
	}

	public async runPythonCode(code: string): Promise<void> {
		await this.postMessageAsync({
			type: "run-python-code",
			data: {
				code
			}
		});
		this.firstRunPromiseDelegate.resolve();
	}

	public async runPythonFile(path: string): Promise<void> {
		await this.postMessageAsync({
			type: "run-python-file",
			data: {
				path
			}
		});
		this.firstRunPromiseDelegate.resolve();
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

			this.postMessageTarget.postMessage(msg, [channel.port2]);
		});
	}

	private _processWorkerMessage(msg: OutMessage): void {
		switch (msg.type) {
			case "progress-update": {
				this.dispatchEvent(
					new CustomEvent("progress-update", {
						detail: msg.data.log
					})
				);
				break;
			}
		}
	}

	public async httpRequest(request: HttpRequest): Promise<HttpResponse> {
		// Wait for the first run to be done
		// to avoid the "Gradio app has not been launched." error
		// in case running the code takes long time.
		// Ref: https://github.com/gradio-app/gradio/issues/5957
		await this.firstRunPromiseDelegate.promise;

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

	public openWebSocket(path: string): MessagePortWebSocket {
		const channel = new MessageChannel();

		const msg: InMessageWebSocket = {
			type: "websocket",
			data: {
				path
			}
		};
		this.postMessageTarget.postMessage(msg, [channel.port2]);

		return new MessagePortWebSocket(channel.port1);
	}

	public writeFile(
		path: string,
		data: string | ArrayBufferView,
		opts?: Record<string, unknown>
	): Promise<void> {
		return this.postMessageAsync({
			type: "file:write",
			data: {
				path,
				data,
				opts
			}
		}) as Promise<void>;
	}

	public renameFile(oldPath: string, newPath: string): Promise<void> {
		return this.postMessageAsync({
			type: "file:rename",
			data: {
				oldPath,
				newPath
			}
		}) as Promise<void>;
	}

	public unlink(path: string): Promise<void> {
		return this.postMessageAsync({
			type: "file:unlink",
			data: {
				path
			}
		}) as Promise<void>;
	}

	public install(requirements: string[]): Promise<void> {
		return this.postMessageAsync({
			type: "install",
			data: {
				requirements
			}
		}) as Promise<void>;
	}

	public terminate(): void {
		if (isMessagePort(this.postMessageTarget)) {
			console.debug("Closing the message port...");
			this.postMessageTarget.close();
		}
		if (isDedicatedWorker(this.worker)) {
			console.debug("Terminating the worker...");
			this.worker.terminate();
		}
	}
}

function isDedicatedWorker(
	obj: globalThis.Worker | SharedWorker
): obj is globalThis.Worker {
	return "terminate" in obj;
}

function isMessagePort(
	obj: globalThis.Worker | MessagePort
): obj is MessagePort {
	return "postMessage" in obj;
}
