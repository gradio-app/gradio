import type { WorkerProxy } from "./worker-proxy";

function getPathFromUrl(url: string): string {
	const a = document.createElement("a");
	a.href = url;
	return a.pathname;
}

// Mock `js/app/src/main.ts:mount_css` for the Wasm version.
// TODO: Use shared code.
export async function mount_css(
	workerProxy: WorkerProxy,
	url: string,
	target: HTMLElement
): Promise<void> {
	const path = getPathFromUrl(url);

	const response = await workerProxy.httpRequest({
		method: "GET",
		path,
		query_string: "",
		headers: {}
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
