import { CrossOriginWorkerMaker as Worker } from "./cross-origin-worker";
import type {
	EmscriptenFile,
	EmscriptenFileUrl,
	InMessage,
	InMessageAsgiRequest,
	OutMessage,
	ReplyMessage
} from "./message-types";
import { PromiseDelegate } from "./promise-delegate";
import {
	type HttpRequest,
	type HttpResponse,
	asgiHeadersToRecord,
	headersToASGI,
	logHttpReqRes
} from "./http";
import type { ASGIScope, ReceiveEvent, SendEvent } from "./asgi-types";

export interface WorkerProxyOptions {
	gradioWheelUrl: string;
	gradioClientWheelUrl: string;
	files: Record<string, EmscriptenFile | EmscriptenFileUrl>;
	requirements: string[];
	sharedWorkerMode: boolean;
}

export class WorkerProxy extends EventTarget {
	worker: globalThis.Worker | globalThis.SharedWorker;
	postMessageTarget: globalThis.Worker | MessagePort;
	firstRunPromiseDelegate = new PromiseDelegate<void>();

	constructor(options: WorkerProxyOptions) {
		super();

		const sharedWorkerMode = options.sharedWorkerMode;

		console.debug("WorkerProxy.constructor(): Create a new worker.");
		// Loading a worker here relies on Vite's support for WebWorkers (https://vitejs.dev/guide/features.html#web-workers),
		// assuming that this module is imported from the Gradio frontend (`@gradio/lite`), which is bundled with Vite.
		// HACK: Use `CrossOriginWorkerMaker` imported as `Worker` here.
		// Read the comment in `cross-origin-worker.ts` for the detail.
		const workerMaker = new Worker(
			new URL("../dist/webworker/webworker.js", import.meta.url),
			{
				/* @vite-ignore */ shared: sharedWorkerMode // `@vite-ignore` is needed to avoid an error `Vite is unable to parse the worker options as the value is not static.`
			}
		);

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
				this.dispatchEvent(
					new CustomEvent("initialization-completed", {
						detail: null
					})
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
	postMessageAsync(msg: InMessage): Promise<unknown> {
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

	_processWorkerMessage(msg: OutMessage): void {
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

	// Initialize an ASGI protocol connection with the ASGI app.
	// The returned `MessagePort` is used to communicate with the ASGI app
	// via the `postMessage()` API and the `message` event.
	// `postMessage()` sends a `ReceiveEvent` to the ASGI app (Be careful not to send a `SendEvent`. This is an event the ASGI app "receives".)
	// The ASGI app sends a `SendEvent` to the `message` event.
	public requestAsgi(scope: Record<string, unknown>): MessagePort {
		const channel = new MessageChannel();

		const msg: InMessageAsgiRequest = {
			type: "asgi-request",
			data: {
				scope
			}
		};
		this.postMessageTarget.postMessage(msg, [channel.port2]);

		return channel.port1;
	}

	public async httpRequest(request: HttpRequest): Promise<HttpResponse> {
		// Wait for the first run to be done
		// to avoid the "Gradio app has not been launched." error
		// in case running the code takes long time.
		// Ref: https://github.com/gradio-app/gradio/issues/5957
		await this.firstRunPromiseDelegate.promise;

		console.debug("WorkerProxy.httpRequest()", request);

		// Dispatch an ASGI request to the ASGI app and gather the response data.
		return new Promise((resolve, reject) => {
			// https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scope
			const asgiScope: ASGIScope = {
				type: "http",
				asgi: {
					version: "3.0",
					spec_version: "2.1"
				},
				http_version: "1.1",
				scheme: "http",
				method: request.method,
				path: decodeURIComponent(request.path),
				query_string: decodeURIComponent(request.query_string),
				root_path: "",
				headers: headersToASGI(request.headers)
			};

			const asgiMessagePort = this.requestAsgi(asgiScope);

			let status: number;
			let headers: { [key: string]: string };
			let body: Uint8Array = new Uint8Array();
			asgiMessagePort.addEventListener("message", (ev) => {
				const asgiSendEvent: SendEvent = ev.data;

				console.debug("send from ASGIapp", asgiSendEvent);
				if (asgiSendEvent.type === "http.response.start") {
					status = asgiSendEvent.status;
					headers = asgiHeadersToRecord(asgiSendEvent.headers);
				} else if (asgiSendEvent.type === "http.response.body") {
					body = new Uint8Array([...body, ...asgiSendEvent.body]);
					if (!asgiSendEvent.more_body) {
						const response: HttpResponse = {
							status,
							headers,
							body
						};
						console.debug("HTTP response", response);

						asgiMessagePort.postMessage({
							type: "http.disconnect"
						} satisfies ReceiveEvent);

						logHttpReqRes(request, response);
						resolve(response);
					}
				} else {
					reject(`Unhandled ASGI event: ${JSON.stringify(asgiSendEvent)}`);
				}
			});

			asgiMessagePort.start();

			if (request.body instanceof ReadableStream) {
				// The following code reading the stream is based on the example in https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader#examples
				const reader = request.body.getReader();
				reader.read().then(function process({
					done,
					value
				}): Promise<void> | void {
					if (done) {
						asgiMessagePort.postMessage({
							type: "http.request",
							more_body: false,
							body: undefined
						} satisfies ReceiveEvent);
						return;
					}

					asgiMessagePort.postMessage({
						type: "http.request",
						more_body: !done,
						body: value
					} satisfies ReceiveEvent);

					return reader.read().then(process);
				});
			} else {
				asgiMessagePort.postMessage({
					type: "http.request",
					more_body: false,
					body: request.body ?? undefined
				} satisfies ReceiveEvent);
			}
		});
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
	return "close" in obj;
}
