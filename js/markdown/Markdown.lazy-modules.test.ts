// Tests where the lazily imported KaTeX and mermaid modules fail or hang.
// vi.mock applies to the whole file, so they live apart from Markdown.test.ts.
import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";

import Markdown from "./Index.svelte";

vi.mock("katex/contrib/auto-render", () => ({
	default: () => {
		throw new Error("KaTeX failed");
	}
}));

const default_props = {
	value: "",
	label: "Markdown",
	show_label: true,
	interactive: false,
	rtl: false,
	sanitize_html: true,
	line_breaks: false,
	header_links: false,
	buttons: null as string[] | null,
	height: null as number | null,
	min_height: null as number | null,
	max_height: null as number | null,
	container: false,
	latex_delimiters: [{ left: "$", right: "$", display: false }]
};

describe("Lazily imported modules", () => {
	afterEach(() => cleanup());

	test("renders the text when KaTeX fails", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			const { container } = await render(Markdown, {
				...default_props,
				value: "It costs $5 or $10."
			});

			await waitFor(() =>
				expect(container.querySelector(".md p")?.textContent).toBe(
					"It costs $5 or $10."
				)
			);
		} finally {
			error.mockRestore();
		}
	});
});
