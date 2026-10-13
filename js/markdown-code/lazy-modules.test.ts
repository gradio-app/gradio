// Tests where the lazily imported KaTeX and mermaid modules fail or hang.
// vi.mock applies to the whole file, so they live apart from
// js/markdown/Markdown.test.ts, and here so that the mocked modules resolve
// as they do for MarkdownCode.svelte.
import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";

import Markdown from "../markdown/Index.svelte";

vi.mock("katex/contrib/auto-render", () => ({
	default: () => {
		throw new Error("KaTeX failed");
	}
}));

// A diagram that never finishes drawing, like mermaid loading slowly.
const { mermaid_run } = vi.hoisted(() => ({
	mermaid_run: vi.fn(() => new Promise<void>(() => {}))
}));
vi.mock("mermaid", () => ({
	default: {
		initialize: () => {},
		run: mermaid_run
	}
}));

// A syntax highlighter that loads only when the test releases it.
const { prism_go } = vi.hoisted(() => {
	let release = (): void => {};
	const loaded = new Promise<void>((resolve) => (release = resolve));
	return { prism_go: { loaded, release: () => release() } };
});
vi.mock("prismjs/components/prism-go", async () => {
	await prism_go.loaded;
	return {};
});

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

	test("keeps rendering text while a mermaid diagram is drawn", async () => {
		const diagram = "```mermaid\ngraph TD\n  A --> B\n```";
		const { set_data, container } = await render(Markdown, {
			...default_props,
			value: diagram
		});
		await waitFor(() => expect(mermaid_run).toHaveBeenCalled());

		await set_data({ value: `${diagram}\n\nAfter the diagram.` });

		await waitFor(() =>
			expect(container.querySelector(".md > p")?.textContent).toBe(
				"After the diagram."
			)
		);
	});

	test("rebuilds when a rendered node is removed during a render", async () => {
		const { set_data, container } = await render(Markdown, {
			...default_props,
			value: "A\n\nB\n\nC"
		});
		const paragraph_texts = (): (string | null)[] =>
			Array.from(container.querySelectorAll(".md p"), (p) => p.textContent);
		await waitFor(() => expect(paragraph_texts()).toEqual(["A", "B", "C"]));

		await set_data({ value: "A\n\n```go\nx := 1\n```\n\nC" });
		// The render is now waiting for the go highlighter.
		expect(paragraph_texts()).toEqual(["A", "B", "C"]);
		container.querySelectorAll(".md p")[2].remove();
		prism_go.release();

		await waitFor(() => {
			expect(paragraph_texts()).toEqual(["A", "C"]);
			expect(container.querySelector(".md pre code")?.textContent).toContain(
				"x := 1"
			);
		});
	});
});
