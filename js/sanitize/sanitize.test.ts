import { describe, expect, test } from "vitest";

import { sanitize } from "./browser";

describe("sanitize", () => {
	test("opens non-fragment links in a new tab", () => {
		const node = new DOMParser().parseFromString(
			sanitize('<a href="/docs">docs</a>'),
			"text/html"
		);

		const link = node.querySelector("a");
		expect(link?.getAttribute("href")).toBe("/docs");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
	});

	test("keeps hash-only links in the same page", () => {
		const node = new DOMParser().parseFromString(
			sanitize('<a href="#section">section</a>'),
			"text/html"
		);

		const link = node.querySelector("a");
		expect(link?.getAttribute("href")).toBe("#section");
		expect(link?.getAttribute("target")).toBeNull();
		expect(link?.getAttribute("rel")).toBeNull();
	});

	test("removes style elements and their content", () => {
		const result = sanitize(
			"<p>hello</p><style>body { background: red; }</style>"
		);

		expect(result).toBe("<p>hello</p>");
	});

	test("removes style elements inside svg", () => {
		const result = sanitize(
			"<svg><style>body { background: red; }</style><circle r='1'></circle></svg>"
		);

		expect(result).not.toContain("<style>");
		expect(result).toContain("<circle");
	});

	test("removes link elements", () => {
		const result = sanitize(
			'<p>hello</p><link rel="stylesheet" href="https://example.com/style.css">'
		);

		expect(result).toBe("<p>hello</p>");
	});

	test("keeps style attributes", () => {
		const node = new DOMParser().parseFromString(
			sanitize('<p style="color: red;">hello</p>'),
			"text/html"
		);

		const p = node.querySelector("p");
		expect(p?.getAttribute("style")).toBe("color: red;");
		expect(p?.textContent).toBe("hello");
	});
});
