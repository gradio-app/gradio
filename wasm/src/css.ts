import type { WorkerProxy } from "./worker-proxy";

// Mock `js/app/src/main.ts:mount_css` for the Wasm version.
// TODO: Use shared code.
export async function mount_css(
	workerProxy: WorkerProxy,
	path: string,
	target: HTMLElement
): Promise<void> {
	const response = await workerProxy.httpRequest({
		method: "GET",
		path,
		query_string: "",
		headers: {},
		body: new Uint8Array([])
	});
	const css = new TextDecoder().decode(response.body);

	const existing_link = document.querySelector(
		`style[data-wasm-path='${path}']`
	);
	if (existing_link) return;

	const style = document.createElement("style");
	style.setAttribute("data-wasm-path", path);
	style.textContent = css;
	// @ts-ignore
	target.appendChild(style);

	return;
}
