export function wasmClient() {
	// TODO: Implement wasm client
	console.log("Hello, Wasm world!");

	// Loading a worker here relies on Vite's support for WebWorkers (https://vitejs.dev/guide/features.html#web-workers),
	// assuming that this module is imported from the Gradio frontend, which is compiled with Vite.
	const worker = new Worker(new URL('./webworker.js', import.meta.url));
}
