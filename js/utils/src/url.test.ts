import { describe, expect, test, vi } from "vitest";
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

	test("keeps the backend origin for same-host embeds when the page is not served by gradio", () => {
		// Like an embedding page at localhost:3000 pointing a <gradio-app> at
		// a gradio server on localhost:7860.
		vi.stubGlobal("window", {
			location: { href: "http://localhost:3000/docs" }
		});

		try {
			const url = resolve_current_origin_url(
				"http://localhost:7860",
				"/theme.css"
			);
			expect(url.origin).toBe("http://localhost:7860");
		} finally {
			vi.unstubAllGlobals();
		}
	});

	test("uses the page origin for same-host roots when the page is served by gradio", () => {
		vi.stubGlobal("window", {
			location: { href: "http://localhost:20080/gradio" },
			gradio_config: {}
		});

		try {
			const url = resolve_current_origin_url(
				"http://localhost:7860/gradio",
				"/theme.css"
			);
			expect(url.origin).toBe("http://localhost:20080");
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
