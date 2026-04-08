import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Code from "./Index.svelte";

const default_props = {
	value: "print('hello')",
	language: "python",
	lines: 5,
	interactive: true,
	show_label: true,
	label: "Code"
};

// Code uses BlockLabel (not BlockTitle/block-info) and conditionally renders it
// via {#if show_label}, so the shared show_label:false test (which expects the
// label to remain in the DOM with sr-only) does not apply. Custom label tests
// are written below in the "Props: show_label" describe block.
run_shared_prop_tests({
	component: Code,
	name: "Code",
	base_props: {
		value: "print('hello')",
		language: "python",
		lines: 5
	},
	has_label: false
});

describe("Props: show_label", () => {
	afterEach(() => cleanup());

	test("show_label=true renders the label text", async () => {
		const { getByText } = await render(Code, {
			...default_props,
			label: "My Code Editor",
			show_label: true
		});
		expect(getByText("My Code Editor")).toBeVisible();
	});

	test("show_label=false hides the label from view", async () => {
		const { queryByText } = await render(Code, {
			...default_props,
			label: "My Code Editor",
			show_label: false
		});
		// Code uses {#if show_label} so the BlockLabel is not rendered at all.
		expect(queryByText("My Code Editor")).toBeNull();
	});

	test("label text is derived from the label prop", async () => {
		const { getByText } = await render(Code, {
			...default_props,
			label: "Custom Label Text",
			show_label: true
		});
		expect(getByText("Custom Label Text")).toBeTruthy();
	});
});

describe("Code", () => {
	afterEach(() => cleanup());

	test("renders the code editor when a value is provided", async () => {
		const { getByLabelText } = await render(Code, default_props);
		expect(getByLabelText("Code input container")).toBeTruthy();
	});

	test("renders the editor when interactive with no value", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			value: ""
		});
		expect(getByLabelText("Code input container")).toBeTruthy();
	});

	test("renders empty state (no editor) when value is empty and not interactive", async () => {
		const { queryByLabelText } = await render(Code, {
			...default_props,
			value: "",
			interactive: false
		});
		expect(queryByLabelText("Code input container")).toBeNull();
	});

	test("renders the editor (not empty state) when value is present and not interactive", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			interactive: false
		});
		expect(getByLabelText("Code input container")).toBeTruthy();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true makes the editor contenteditable", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			interactive: true
		});
		const editor = getByLabelText("Code input container");
		expect(editor).toHaveAttribute("contenteditable", "true");
	});

	test("interactive=false makes the editor read-only", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			interactive: false
		});
		const editor = getByLabelText("Code input container");
		expect(editor).toHaveAttribute("contenteditable", "false");
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("default (null) shows both copy and download buttons", async () => {
		const { getByLabelText, getByRole } = await render(Code, {
			...default_props,
			buttons: null
		});
		expect(getByLabelText("Copy")).toBeTruthy();
		expect(getByLabelText("Download")).toBeTruthy();
	});

	test("buttons=['copy', 'download'] shows both buttons", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			buttons: ["copy", "download"]
		});
		expect(getByLabelText("Copy")).toBeTruthy();
		expect(getByLabelText("Download")).toBeTruthy();
	});

	test("buttons=['copy'] shows only the copy button", async () => {
		const { getByLabelText, queryByLabelText } = await render(Code, {
			...default_props,
			buttons: ["copy"]
		});
		expect(getByLabelText("Copy")).toBeTruthy();
		expect(queryByLabelText("Download")).toBeNull();
	});

	test("buttons=['download'] shows only the download button", async () => {
		const { getByLabelText, queryByLabelText } = await render(Code, {
			...default_props,
			buttons: ["download"]
		});
		expect(getByLabelText("Download")).toBeTruthy();
		expect(queryByLabelText("Copy")).toBeNull();
	});

	test("buttons=[] shows no copy or download buttons", async () => {
		const { queryByLabelText } = await render(Code, {
			...default_props,
			buttons: []
		});
		expect(queryByLabelText("Copy")).toBeNull();
		expect(queryByLabelText("Download")).toBeNull();
	});

	test("custom button is rendered in the toolbar", async () => {
		const { getByRole } = await render(Code, {
			...default_props,
			buttons: [{ id: 42, value: "Run", icon: null }]
		});
		expect(getByRole("button", { name: "Run" })).toBeTruthy();
	});

	test("clicking a custom button fires custom_button_click with the button id", async () => {
		const { listen, getByRole } = await render(Code, {
			...default_props,
			buttons: [{ id: 99, value: "Execute", icon: null }]
		});
		const custom = listen("custom_button_click");
		await fireEvent.click(getByRole("button", { name: "Execute" }));
		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 99 });
	});
});

describe("Props: language", () => {
	afterEach(() => cleanup());

	const languages = [
		"python",
		"javascript",
		"typescript",
		"json",
		"html",
		"css",
		"markdown",
		"shell",
		"sql",
		"yaml",
		"dockerfile",
		"r",
		"c",
		"cpp"
	] as const;

	for (const lang of languages) {
		test(`language='${lang}' renders without error`, async () => {
			const { getByLabelText } = await render(Code, {
				...default_props,
				language: lang
			});
			expect(getByLabelText("Code input container")).toBeTruthy();
		});
	}

	test("language=null renders without error", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			language: null
		});
		expect(getByLabelText("Code input container")).toBeTruthy();
	});
});

test.todo(
	"VISUAL: lines=10 sets the minimum visible height of the editor to 10 line-heights — needs Playwright screenshot comparison"
);

test.todo(
	"VISUAL: max_lines=3 caps the editor height at 3 line-heights and enables scrolling for longer content — needs Playwright screenshot comparison"
);

test.todo(
	"VISUAL: show_line_numbers=true renders the line number gutter — needs Playwright screenshot comparison"
);

test.todo(
	"VISUAL: show_line_numbers=false hides the line number gutter — needs Playwright screenshot comparison"
);

test.todo(
	"VISUAL: wrap_lines=true wraps long lines within the container width instead of scrolling — needs Playwright screenshot comparison"
);

test.todo(
	"VISUAL: wrap_lines=false lets long lines overflow horizontally — needs Playwright screenshot comparison"
);

test.todo(
	"VISUAL: autocomplete=true shows an autocompletion dropdown when typing in supported languages — needs Playwright interaction test"
);

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: not fired on initial mount", async () => {
		const { listen } = await render(Code, default_props);
		// retrospective: true replays any events buffered during render
		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("change: fired when value is updated via set_data", async () => {
		const { listen, set_data } = await render(Code, default_props);
		const change = listen("change");
		await set_data({ value: "print('world')" });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change: not fired when the same value is set twice", async () => {
		const { listen, set_data } = await render(Code, default_props);
		const change = listen("change");
		await set_data({ value: "x = 1" });
		await set_data({ value: "x = 1" });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("input: fired when the user types in the editor", async () => {
		const { listen, getByLabelText } = await render(Code, default_props);
		const input = listen("input");
		const editor = getByLabelText("Code input container");
		editor.focus();
		await event.keyboard("a");
		await waitFor(() => expect(input).toHaveBeenCalledTimes(1));
	});

	test("focus: fired when the editor gains focus", async () => {
		const { listen, getByLabelText } = await render(Code, default_props);
		const focus = listen("focus");
		const editor = getByLabelText("Code input container");
		editor.focus();
		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("blur: fired when the editor loses focus", async () => {
		const { listen, getByLabelText } = await render(Code, default_props);
		const blur = listen("blur");
		const editor = getByLabelText("Code input container");
		editor.focus();
		editor.blur();
		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("custom_button_click: carries the button id in the payload", async () => {
		const { listen, getByRole } = await render(Code, {
			...default_props,
			buttons: [{ id: 7, value: "Go", icon: null }]
		});
		const custom = listen("custom_button_click");
		await fireEvent.click(getByRole("button", { name: "Go" }));
		expect(custom).toHaveBeenCalledWith({ id: 7 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the initial value", async () => {
		const { get_data } = await render(Code, default_props);
		const data = await get_data();
		expect(data.value).toBe("print('hello')");
	});

	test("set_data updates the value returned by get_data", async () => {
		const { get_data, set_data } = await render(Code, default_props);
		await set_data({ value: "x = 42" });
		const data = await get_data();
		expect(data.value).toBe("x = 42");
	});

	test("set_data / get_data round-trip", async () => {
		const { get_data, set_data } = await render(Code, default_props);
		const new_value = "def foo():\n    return 1";
		await set_data({ value: new_value });
		const data = await get_data();
		expect(data.value).toBe(new_value);
	});

	test("user typing is reflected in get_data", async () => {
		const { get_data, getByLabelText } = await render(Code, {
			...default_props,
			value: ""
		});
		const editor = getByLabelText("Code input container");
		editor.focus();
		await event.keyboard("hi");
		await waitFor(async () => {
			const data = await get_data();
			expect(data.value).toContain("hi");
		});
	});
});

describe("Copy button", () => {
	afterEach(() => cleanup());

	test("clicking the copy button writes the code value to the clipboard", async () => {
		// navigator.clipboard is unavailable in insecure (non-HTTPS) test origins
		// so we mock writeText to prevent the silent no-op in Copy.svelte's `if
		// ("clipboard" in navigator)` guard. This mock makes clipboard available.
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			writable: true,
			configurable: true
		});

		const { getByLabelText } = await render(Code, {
			...default_props,
			value: "my code"
		});
		await fireEvent.click(getByLabelText("Copy"));
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("my code");
	});

	test.todo(
		"VISUAL: copy button icon changes from Copy to Check for ~2 seconds after clicking — needs Playwright screenshot comparison"
	);
});

describe("Download button", () => {
	afterEach(() => cleanup());

	test("download link has filename extension matching the language", async () => {
		const { getByRole } = await render(Code, {
			...default_props,
			language: "python",
			value: "print('hello')"
		});
		// The Download button is inside an <a download="file.py"> anchor
		const link = getByRole("link");
		expect(link).toHaveAttribute("download", "file.py");
	});

	test("download link href is a blob URL", async () => {
		const { getByRole } = await render(Code, {
			...default_props,
			value: "some code"
		});
		const link = getByRole("link");
		expect(link.getAttribute("href")).toMatch(/^blob:/);
	});

	test.todo(
		"VISUAL: download button icon changes from Download to Check for ~2 seconds after clicking — needs Playwright screenshot comparison"
	);
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("null value renders without error", async () => {
		const { queryByLabelText } = await render(Code, {
			...default_props,
			value: null
		});
		// null value with non-interactive should show empty state (no editor)
		// but with interactive=true, editor is shown
		expect(queryByLabelText("Code input container")).toBeTruthy();
	});

	test("empty string value with interactive=true shows the editor", async () => {
		const { getByLabelText } = await render(Code, {
			...default_props,
			value: "",
			interactive: true
		});
		expect(getByLabelText("Code input container")).toBeTruthy();
	});

	test("value with leading and trailing whitespace is displayed", async () => {
		const { get_data } = await render(Code, {
			...default_props,
			value: "  hello  "
		});
		const data = await get_data();
		expect(data.value).toBe("  hello  ");
	});
});
