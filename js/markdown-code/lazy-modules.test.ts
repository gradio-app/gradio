// Tests where the lazily imported KaTeX and mermaid modules fail or hang.
// vi.mock applies to the whole file, so they live apart from
// js/markdown/Markdown.test.ts, and here so that the mocked modules resolve
// as they do for MarkdownCode.svelte.
import { test, describe, afterEach, expect, vi } from "vitest";
import { mount, unmount } from "svelte";
import { cleanup, render, waitFor } from "@self/tootils/render";

import Markdown from "../markdown/Index.svelte";
import MarkdownCode from "./MarkdownCode.svelte";

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

	test("calls onload when a mermaid diagram fails to draw", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		mermaid_run.mockClear();
		mermaid_run.mockRejectedValueOnce(new Error("Parse error"));
		const onload = vi.fn();
		const target = document.body.appendChild(document.createElement("div"));
		const component = mount(MarkdownCode, {
			target,
			props: {
				message: "```mermaid\ngraph TD\n  A --> B\n```",
				onload
			}
		});
		try {
			await waitFor(() => expect(mermaid_run).toHaveBeenCalled());
			await waitFor(() => expect(onload).toHaveBeenCalledTimes(2));
		} finally {
			unmount(component);
			target.remove();
			error.mockRestore();
		}
	});
});
