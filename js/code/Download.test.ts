/**
 * Tests for Download.svelte's language → file-extension mapping.
 *
 * Download.svelte is not a Gradio component so the tootils render() utility
 * cannot mount it with props correctly (non-shared props are wrapped under a
 * `props` key rather than spread at the top level). We therefore test the
 * extension mapping through the full Code component, which is the realistic
 * usage path anyway.
 */
import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Code from "./Index.svelte";

const base_props = {
	value: "// code",
	lines: 5,
	interactive: false,
	show_label: false,
	label: "Code",
	buttons: ["download"] as const
};

function get_download_link(container: HTMLElement): HTMLAnchorElement {
	// The Download component renders an <a download="file.ext"> anchor.
	// No accessible name or role distinguishes it better than the download
	// attribute itself, so querySelector is used as the last-resort query.
	const link = container.querySelector<HTMLAnchorElement>("a[download]");
	if (!link) throw new Error("No download link found in rendered output");
	return link;
}

describe("Download: language → file extension mapping", () => {
	afterEach(() => cleanup());

	const cases: Array<[string, string]> = [
		["python", "py"],
		["py", "py"],
		["javascript", "js"],
		["js", "js"],
		["typescript", "ts"],
		["ts", "ts"],
		["shell", "sh"],
		["sh", "sh"],
		["markdown", "md"],
		["md", "md"],
		["json", "json"],
		["html", "html"],
		["css", "css"],
		["yaml", "yaml"],
		["yml", "yml"],
		["dockerfile", "dockerfile"],
		["latex", "tex"],
		["r", "r"],
		["c", "c"],
		["cpp", "cpp"]
	];

	for (const [language, expected_ext] of cases) {
		test(`language='${language}' produces download filename 'file.${expected_ext}'`, async () => {
			const { container } = await render(Code, {
				...base_props,
				language
			});
			const link = get_download_link(container);
			expect(link).toHaveAttribute("download", `file.${expected_ext}`);
		});
	}

	test("unknown language falls back to 'file.txt'", async () => {
		const { container } = await render(Code, {
			...base_props,
			language: "brainfuck"
		});
		const link = get_download_link(container);
		expect(link).toHaveAttribute("download", "file.txt");
	});

	test("null language falls back to 'file.txt'", async () => {
		const { container } = await render(Code, {
			...base_props,
			language: null
		});
		const link = get_download_link(container);
		expect(link).toHaveAttribute("download", "file.txt");
	});
});

describe("Download: link structure", () => {
	afterEach(() => cleanup());

	test("download link href is a blob URL", async () => {
		const { container } = await render(Code, {
			...base_props,
			language: "python"
		});
		const link = get_download_link(container);
		expect(link.getAttribute("href")).toMatch(/^blob:/);
	});

	test("download link is visible", async () => {
		const { container } = await render(Code, {
			...base_props,
			language: "python"
		});
		const link = get_download_link(container);
		expect(link).toBeVisible();
	});

	test("download link contains a button with label 'Download'", async () => {
		const { getByLabelText } = await render(Code, {
			...base_props,
			language: "python"
		});
		expect(getByLabelText("Download")).toBeTruthy();
	});

	test.todo(
		"VISUAL: clicking the download link changes the icon from Download to Check for ~2 seconds — needs Playwright screenshot comparison"
	);
});
