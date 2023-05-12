import { WorkerProxy } from "./worker-proxy";

export function wasmClient() {
	// TODO: Implement wasm client
	console.log("Hello, Wasm world!");

	const workerProxy = new WorkerProxy();
	workerProxy.test();
}
