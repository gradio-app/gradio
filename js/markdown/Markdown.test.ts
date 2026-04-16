import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import Markdown from "./Index.svelte";

const default_props = {
	value: "Hello world",
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
	latex_delimiters: [{ left: "$$", right: "$$", display: true }]
};

run_shared_prop_tests({
	component: Markdown,
	name: "Markdown",
	base_props: {
		value: "Hello",
		label: "Markdown"
	},
	has_label: false,
	has_validation_error: false
});

describe("Markdown", () => {
	afterEach(() => cleanup());

	test("renders markdown content as text", async () => {
		const { getByText } = await render(Markdown, {
			...default_props,
			value: "Hello world"
		});

		expect(getByText("Hello world")).toBeVisible();
	});

	test("renders markdown links correctly", async () => {
		const { getByText } = await render(Markdown, {
			...default_props,
			value: "Visit [Gradio](https://www.gradio.app/) for more information."
		});

		const link = getByText("Gradio") as HTMLAnchorElement;
		expect(link.tagName).toBe("A");
		expect(link.href).toBe("https://www.gradio.app/");
	});

	test("renders markdown with invalid URL", async () => {
		const { getByText } = await render(Markdown, {
			...default_props,
			value: "Visit [Invalid URL](https://) for more information."
		});

		const link = getByText("Invalid URL") as HTMLAnchorElement;
		expect(link.href).toBe("https://");
	});

	test("renders markdown headings", async () => {
		const { getByRole } = await render(Markdown, {
			...default_props,
			value: "# Hello"
		});

		const heading = getByRole("heading", { level: 1 });
		expect(heading).toBeVisible();
	});
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("renders simple text value", async () => {
		const { getByText } = await render(Markdown, {
			...default_props,
			value: "Simple text"
		});

		expect(getByText("Simple text")).toBeVisible();
	});

	test("renders empty value without error", async () => {
		const { getByTestId } = await render(Markdown, {
			...default_props,
			value: ""
		});

		expect(getByTestId("markdown")).toBeVisible();
	});

	test.todo(
		"VISUAL: renders code blocks with syntax highlighting, bold text, italic text"
	);
});

describe("Props: rtl", () => {
	afterEach(() => cleanup());

	test("rtl=true sets right-to-left direction on markdown element", async () => {
		const { getByTestId } = await render(Markdown, {
			...default_props,
			rtl: true
		});

		const md = getByTestId("markdown");
		expect(md).toHaveAttribute("dir", "rtl");
	});

	test("rtl=false sets left-to-right direction on markdown element", async () => {
		const { getByTestId } = await render(Markdown, {
			...default_props,
			rtl: false
		});

		const md = getByTestId("markdown");
		expect(md).toHaveAttribute("dir", "ltr");
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("buttons=['copy'] renders a copy button", async () => {
		const { getByRole } = await render(Markdown, {
			...default_props,
			buttons: ["copy"]
		});

		const btn = getByRole("button", { name: "Copy conversation" });
		expect(btn).toBeVisible();
	});

	test("buttons=null does not render a copy button", async () => {
		const { queryByRole } = await render(Markdown, {
			...default_props,
			buttons: null
		});

		const btn = queryByRole("button", { name: "Copy conversation" });
		expect(btn).not.toBeInTheDocument();
	});

	test("clicking copy button dispatches copy event", async () => {
		const { getByRole, listen } = await render(Markdown, {
			...default_props,
			value: "Copy me!",
			buttons: ["copy"]
		});

		const copy_event = listen("copy");
		const btn = getByRole("button", {
			name: "Copy conversation"
		}) as HTMLButtonElement;
		btn.focus();
		await fireEvent.mouseDown(btn);
		await fireEvent.click(btn);

		await waitFor(async () => {
			expect(await navigator.clipboard.readText()).toBe("Copy me!");
		});
		expect(copy_event).toHaveBeenCalledTimes(1);

		vi.unstubAllGlobals();
	});

	test("copy button label changes after clicking", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText }
		});

		const { getByRole } = await render(Markdown, {
			...default_props,
			value: "Test",
			buttons: ["copy"]
		});

		const btn = getByRole("button", { name: "Copy conversation" });
		await fireEvent.click(btn);

		await waitFor(() => {
			expect(
				getByRole("button", { name: "Copied conversation" })
			).toBeVisible();
		});

		vi.unstubAllGlobals();
	});
});

describe("Props: padding", () => {
	afterEach(() => cleanup());

	test.todo("VISUAL: padding=true adds padding class to wrapper");
});

describe("Props: height", () => {
	afterEach(() => cleanup());

	test.todo(
		"VISUAL: height causes scrolling when markdown content overflows — needs Playwright visual regression screenshot comparison"
	);
});

describe("Props: min_height", () => {
	afterEach(() => cleanup());

	test.todo("VISUAL: min_height applies minimum height to the Block wrapper");
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("change is dispatched when value is set via set_data", async () => {
		const { listen, set_data } = await render(Markdown, {
			...default_props,
			value: "Initial"
		});

		const change = listen("change");

		await set_data({ value: "Updated" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change is not dispatched for same value", async () => {
		const { listen, set_data } = await render(Markdown, {
			...default_props,
			value: "Same"
		});

		const change = listen("change");

		await set_data({ value: "Same" });

		expect(change).toHaveBeenCalledTimes(0);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("set_data updates the rendered markdown content", async () => {
		const { set_data, getByText, queryByText } = await render(Markdown, {
			...default_props,
			value: "Old content"
		});

		expect(getByText("Old content")).toBeVisible();

		await set_data({ value: "New content" });

		expect(queryByText("Old content")).not.toBeInTheDocument();
		expect(getByText("New content")).toBeVisible();
	});

	test("get_data returns the current value", async () => {
		const { get_data } = await render(Markdown, {
			...default_props,
			value: "Test value"
		});

		const data = await get_data();
		expect(data.value).toBe("Test value");
	});

	test("set_data then get_data round-trips", async () => {
		const { set_data, get_data } = await render(Markdown, {
			...default_props,
			value: "Original"
		});

		await set_data({ value: "Updated" });
		const data = await get_data();
		expect(data.value).toBe("Updated");
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("change event fires on mount when value is truthy", async () => {
		// The Markdown component's $effect fires onchange when value is initially set,
		// which dispatches a "change" event on mount. This is by design.
		const { listen } = await render(Markdown, {
			...default_props,
			value: "Initial"
		});

		const change = listen("change", { retrospective: true });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("no change event fires on mount when value is empty", async () => {
		const { listen } = await render(Markdown, {
			...default_props,
			value: ""
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test.todo(
		"VISUAL: sanitize_html=false allows raw HTML rendering — needs Playwright visual regression or content inspection test"
	);

	test.todo(
		"VISUAL: header_links=true creates anchor links on headings — needs Playwright visual regression screenshot comparison"
	);

	test.todo(
		"VISUAL: latex_delimiters renders LaTeX expressions — needs Playwright visual regression or MathJax verification"
	);

	test.todo(
		"VISUAL: line_breaks=true enables GFM line breaks — needs Playwright visual regression screenshot comparison"
	);
});
