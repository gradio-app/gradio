import type { WorkerProxy } from "@gradio/wasm";
import { is_self_host } from "@gradio/wasm/network";
import { mount_css as default_mount_css } from "../css";

// In the Wasm mode, we use a prebuilt CSS file `/static/css/theme.css` to apply the styles in the initialization phase,
// because it will take a long time for `theme.css` to be available after opening the app and loading the Pyodide and the server code.
// The prebuild CSS will be replaced with the dynamic `theme.css` when it is available and `wasm_proxied_mount_css()` is called with its URL.
const PREBUILT_CSS_URL = new URL("./theme.css", import.meta.url).href;
const DYNAMIC_THEME_CSS_URL_PATH = "/theme.css";

export function mount_prebuilt_css(
	target: Parameters<typeof default_mount_css>[1]
): Promise<void> {
	return default_mount_css(PREBUILT_CSS_URL, target);
}

export async function wasm_proxied_mount_css(
	worker_proxy: WorkerProxy,
	url_string: string,
	target: HTMLElement
): Promise<void> {
	const request = new Request(url_string); // Resolve a relative URL.
	const url = new URL(request.url);

	if (!is_self_host(url)) {
		// Fallback to the default implementation for external resources.
		return default_mount_css(url_string, target);
	}

	const response = await worker_proxy.httpRequest({
		method: "GET",
		path: url.pathname,
		query_string: "",
		headers: {}
	});
	const css = new TextDecoder().decode(response.body);

	const existing_link = document.querySelector(
		`style[data-wasm-path='${url_string}']`
	);
	if (existing_link) return;

	if (url.pathname === DYNAMIC_THEME_CSS_URL_PATH) {
		console.debug(
			"Unmount the prebuilt theme.css before mounting the dynamic theme.css"
		);
		const existing_prebuilt_css = document.querySelector(
			`link[href='${PREBUILT_CSS_URL}']`
		);
		existing_prebuilt_css?.remove();
	}

	const style = document.createElement("style");
	style.setAttribute("data-wasm-path", url_string);
	style.textContent = css;
	// @ts-ignore
	target.appendChild(style);
}
