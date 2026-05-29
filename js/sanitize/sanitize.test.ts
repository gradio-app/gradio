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
});
