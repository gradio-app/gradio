import { WorkerProxy } from "./worker-proxy";

export interface WasmClientOptions {
	gradioWheelUrl: string;
	gradioClientWheelUrl: string;
	requirements?: string[];
}
export function wasmClient(options: WasmClientOptions) {
	// TODO: Implement wasm client
	console.log("Hello, Wasm world!");

	const workerProxy = new WorkerProxy({
		gradioWheelUrl: options.gradioWheelUrl,
		gradioClientWheelUrl: options.gradioClientWheelUrl,
		requirements: options.requirements ?? []
	});
}
