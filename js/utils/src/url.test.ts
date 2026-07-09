import { describe, expect, test } from "vitest";
import { resolve_current_origin_url } from "./url";

describe("resolve_current_origin_url", () => {
	test("keeps the current browser origin while preserving the backend root path", () => {
		const url = resolve_current_origin_url(
			"https://machine.local/gradio",
			"/gradio_api/upload_progress?upload_id=abc",
			"https://machine.local:20080/gradio"
		);

		expect(url.toString()).toBe(
			"https://machine.local:20080/gradio/gradio_api/upload_progress?upload_id=abc"
		);
	});

	test("uses the current protocol for same-host https proxies", () => {
		const url = resolve_current_origin_url(
			"http://machine.local/gradio",
			"/theme.css?v=123",
			"https://machine.local/gradio"
		);

		expect(url.toString()).toBe("https://machine.local/gradio/theme.css?v=123");
	});

	test("handles root apps without adding a double slash", () => {
		const url = resolve_current_origin_url(
			"https://machine.local",
			"/static/js/iframeResizer.contentWindow.min.js",
			"https://machine.local:20080/"
		);

		expect(url.toString()).toBe(
			"https://machine.local:20080/static/js/iframeResizer.contentWindow.min.js"
		);
	});

	test("keeps the backend origin for remote roots", () => {
		const url = resolve_current_origin_url(
			"https://remote.example/gradio",
			"/gradio_api/upload_progress?upload_id=abc",
			"https://host.example/page"
		);

		expect(url.toString()).toBe(
			"https://remote.example/gradio/gradio_api/upload_progress?upload_id=abc"
		);
	});
});
