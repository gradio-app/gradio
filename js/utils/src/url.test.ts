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

	// These two cases exercise the window fallback, so they only run in
	// vitest's browser mode where a real window exists.
	const in_browser = typeof window !== "undefined";

	test.skipIf(!in_browser)(
		"keeps the backend origin for same-host embeds when the page is not served by gradio",
		() => {
			// Like an embedding page at localhost:3000 pointing a <gradio-app>
			// at a gradio server on localhost:7860: same hostname as the page,
			// different port, and no window.gradio_config.
			const page = new URL(window.location.href);
			const root = `${page.protocol}//${page.hostname}:7861/gradio`;
			delete (window as any).gradio_config;

			const url = resolve_current_origin_url(root, "/theme.css");

			expect(url.origin).toBe(`${page.protocol}//${page.hostname}:7861`);
		}
	);

	test.skipIf(!in_browser)(
		"uses the page origin for same-host roots when the page is served by gradio",
		() => {
			const page = new URL(window.location.href);
			const root = `${page.protocol}//${page.hostname}:7861/gradio`;
			(window as any).gradio_config = {};

			try {
				const url = resolve_current_origin_url(root, "/theme.css");
				expect(url.origin).toBe(page.origin);
			} finally {
				delete (window as any).gradio_config;
			}
		}
	);
});
