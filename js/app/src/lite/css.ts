import type { WorkerProxy } from "@gradio/wasm";
import { is_self_origin } from "./url";
import { mount_css as default_mount_css } from "../css";

export async function wasm_proxied_mount_css(
	worker_proxy: WorkerProxy,
	url_string: string,
	target: HTMLElement
) {
	const request = new Request(url_string); // Resolve a relative URL.
	const url = new URL(request.url);

	if (!is_self_origin(url)) {
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

	const style = document.createElement("style");
	style.setAttribute("data-wasm-path", url_string);
	style.textContent = css;
	// @ts-ignore
	target.appendChild(style);
}
