import { test, describe, afterEach, beforeEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import JSONOutput from "./Index.svelte";

const default_props = {
	value: { key: "value" },
	label: "JSON Output",
	show_label: true,
	open: false,
	show_indices: false
};

// has_label: false because the shared show_label test looks for [data-testid='block-info']
// which doesn't exist in JSON's BlockLabel structure. JSON uses BlockLabel which applies
// class:hide (display:none) when show_label=false — custom label tests below cover this.
run_shared_prop_tests({
	component: JSONOutput,
	name: "JSON",
	base_props: {
		value: { key: "value" },
		label: "JSON Output"
	},
	has_label: false
});

// Custom label tests to replace the skipped shared label tests
describe("Props: label", () => {
	afterEach(() => cleanup());

	test("label text is rendered", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			label: "My JSON"
		});
		expect(getByText("My JSON")).toBeInTheDocument();
	});

	test("show_label=true makes the label visible", async () => {
		const { getByTestId } = await render(JSONOutput, {
			...default_props,
			show_label: true,
			label: "My JSON"
		});
		expect(getByTestId("block-label")).toBeVisible();
	});

	test("show_label=false hides the label but keeps it in the DOM", async () => {
		const { getByTestId } = await render(JSONOutput, {
			...default_props,
			show_label: false,
			label: "My JSON"
		});
		const label = getByTestId("block-label");
		expect(label).toBeInTheDocument();
		expect(label).not.toBeVisible();
	});
});

describe("JSON", () => {
	afterEach(() => cleanup());

	test("renders an object value", async () => {
		const { getByText } = await render(JSONOutput, default_props);
		expect(getByText('"key"')).toBeVisible();
		expect(getByText('"value"')).toBeVisible();
	});

	test("renders an array value", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: [1, 2, 3]
		});
		expect(getByText("1")).toBeVisible();
		expect(getByText("2")).toBeVisible();
		expect(getByText("3")).toBeVisible();
	});

	test("renders a primitive string value", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: "hello"
		});
		expect(getByText('"hello"')).toBeVisible();
	});

	test("renders a primitive number value", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: 42
		});
		expect(getByText("42")).toBeVisible();
	});

	test("renders boolean true", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: true
		});
		expect(getByText("true")).toBeVisible();
	});

	test("renders boolean false inside an object", async () => {
		// Top-level value=false is falsy → shows empty state; wrap it to test rendering
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: { flag: false }
		});
		expect(getByText("false")).toBeVisible();
	});

	test("renders null inside an object as the text 'null'", async () => {
		// Top-level null shows empty state, so use an object containing null
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: { a: null }
		});
		expect(getByText("null")).toBeVisible();
	});

	test("renders nested objects", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: { outer: { inner: "deep" } }
		});
		expect(getByText('"outer"')).toBeVisible();
		expect(getByText('"inner"')).toBeVisible();
		expect(getByText('"deep"')).toBeVisible();
	});

	test("renders deeply nested structures without crashing", async () => {
		const deep = { a: { b: { c: { d: { e: "bottom" } } } } };
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: deep
		});
		expect(getByText('"a"')).toBeVisible();
	});
});

describe("Empty state", () => {
	afterEach(() => cleanup());

	test("value=null shows Empty state: no copy button, no content", async () => {
		const { queryByLabelText, queryByText } = await render(JSONOutput, {
			...default_props,
			value: null
		});
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
		expect(queryByText('"key"')).not.toBeInTheDocument();
	});

	test("value='' shows Empty state", async () => {
		const { queryByLabelText } = await render(JSONOutput, {
			...default_props,
			value: ""
		});
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
	});

	test("value={} shows Empty state", async () => {
		const { queryByLabelText } = await render(JSONOutput, {
			...default_props,
			value: {}
		});
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
	});

	test("value=[] shows content (empty array is not empty state)", async () => {
		const { getByLabelText } = await render(JSONOutput, {
			...default_props,
			value: []
		});
		// Copy button present means the content branch is rendered
		expect(getByLabelText("Copy")).toBeVisible();
	});

	test("value with content shows copy button", async () => {
		const { getByLabelText } = await render(JSONOutput, default_props);
		expect(getByLabelText("Copy")).toBeVisible();
	});
});

describe("Props: open", () => {
	afterEach(() => cleanup());

	test("open=false (default): shallow nodes start expanded, no preview text", async () => {
		const { queryByText } = await render(JSONOutput, {
			...default_props,
			value: { outer: { inner: "deep" } },
			open: false
		});
		// No nodes are collapsed at depth 0-2, so no Object(...) preview should appear
		expect(queryByText(/Object\(\d+\)/)).not.toBeInTheDocument();
	});

	test("open=false: nodes at depth >= 3 auto-collapse and show preview", async () => {
		// 4-level nesting: root(0) > a(1) > b(2) > c(3) — depth 3 collapses
		const value = { a: { b: { c: { d: "deep" } } } };
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value,
			open: false
		});
		expect(getByText(/Object\(\d+\)/)).toBeVisible();
	});

	test("open=true: all nodes start expanded regardless of depth", async () => {
		const value = { a: { b: { c: { d: "deep" } } } };
		const { queryByText, getByText } = await render(JSONOutput, {
			...default_props,
			value,
			open: true
		});
		// Leaf value visible means nothing was auto-collapsed
		expect(getByText('"deep"')).toBeVisible();
		expect(queryByText(/Object\(\d+\)/)).not.toBeInTheDocument();
	});
});

describe("Props: show_indices", () => {
	afterEach(() => cleanup());

	const array_value = [10, 20, 30];

	test("show_indices=false (default): array indices not rendered as keys", async () => {
		const { queryByText } = await render(JSONOutput, {
			...default_props,
			value: array_value,
			show_indices: false
		});
		expect(queryByText('"0"')).not.toBeInTheDocument();
		expect(queryByText('"1"')).not.toBeInTheDocument();
	});

	test("show_indices=true: array indices rendered as keys", async () => {
		const { getByText } = await render(JSONOutput, {
			...default_props,
			value: array_value,
			show_indices: true
		});
		expect(getByText('"0"')).toBeVisible();
		expect(getByText('"1"')).toBeVisible();
		expect(getByText('"2"')).toBeVisible();
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("buttons=null (default): copy button is shown", async () => {
		const { getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: null as any
		});
		expect(getByLabelText("Copy")).toBeVisible();
	});

	test('buttons=["copy"]: copy button is shown', async () => {
		const { getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: ["copy"]
		});
		expect(getByLabelText("Copy")).toBeVisible();
	});

	test("buttons=[]: copy button is not shown", async () => {
		const { queryByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: []
		});
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
	});

	test("buttons=[custom]: copy button absent, custom button shown", async () => {
		const { queryByLabelText, getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: [{ value: "Run", id: 1, icon: null }]
		});
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
		expect(getByLabelText("Run")).toBeVisible();
	});

	test('buttons=["copy", custom]: both copy and custom button shown', async () => {
		const { getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: ["copy", { value: "Analyze", id: 2, icon: null }]
		});
		expect(getByLabelText("Copy")).toBeVisible();
		expect(getByLabelText("Analyze")).toBeVisible();
	});
});

describe("Copy button", () => {
	// navigator.clipboard.writeText requires HTTPS/permissions in a real browser.
	// Mock it so these tests are deterministic regardless of browser security policy.
	let write_text: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		write_text = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: write_text },
			configurable: true,
			writable: true
		});
	});
	afterEach(() => cleanup());

	test("copy button label is 'Copy' before click", async () => {
		const { getByLabelText } = await render(JSONOutput, default_props);
		expect(getByLabelText("Copy")).toBeVisible();
	});

	test("clicking copy calls clipboard.writeText with pretty-printed JSON", async () => {
		const value = { name: "test", count: 3 };
		const { getByLabelText } = await render(JSONOutput, {
			...default_props,
			value
		});
		await fireEvent.click(getByLabelText("Copy"));
		await waitFor(() => {
			expect(write_text).toHaveBeenCalledTimes(1);
			expect(write_text).toHaveBeenCalledWith(JSON.stringify(value, null, 2));
		});
	});

	test("copy button label changes to 'Copied' after click", async () => {
		const { getByLabelText } = await render(JSONOutput, default_props);
		await fireEvent.click(getByLabelText("Copy"));
		await waitFor(() => {
			expect(getByLabelText("Copied")).toBeVisible();
		});
	});
});

describe("Custom buttons", () => {
	afterEach(() => cleanup());

	test("custom button is rendered with its label", async () => {
		const { getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: [{ value: "Run", id: 42, icon: null }]
		});
		expect(getByLabelText("Run")).toBeVisible();
	});

	test("clicking custom button fires custom_button_click with correct id", async () => {
		const { listen, getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: [{ value: "Run", id: 42, icon: null }]
		});
		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Run"));
		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 42 });
	});
});

describe("Collapse / expand", () => {
	afterEach(() => cleanup());

	test("expandable object node has toggle button with aria-label 'Collapse'", async () => {
		const { getAllByRole } = await render(JSONOutput, {
			...default_props,
			value: { name: "Alice", age: 30 }
		});
		const toggles = getAllByRole("button", { name: "Collapse" });
		expect(toggles.length).toBeGreaterThan(0);
	});

	test("clicking toggle collapses the node and shows Object(N) preview", async () => {
		const { getAllByRole, getByText, queryByText } = await render(JSONOutput, {
			...default_props,
			value: { name: "Alice", age: 30, city: "NYC" }
		});
		const collapse_btn = getAllByRole("button", { name: "Collapse" })[0];
		await fireEvent.click(collapse_btn);
		expect(getByText("Object(3)")).toBeVisible();
		expect(queryByText('"name"')).not.toBeVisible();
	});

	test("clicking toggle again expands the node and hides preview", async () => {
		const { getAllByRole, getByText, queryByText } = await render(JSONOutput, {
			...default_props,
			value: { name: "Alice", age: 30, city: "NYC" }
		});
		// Collapse
		const collapse_btn = getAllByRole("button", { name: "Collapse" })[0];
		await fireEvent.click(collapse_btn);
		// Expand
		const expand_btn = getAllByRole("button", { name: "Expand" })[0];
		await fireEvent.click(expand_btn);
		expect(getByText('"name"')).toBeVisible();
		expect(queryByText("Object(3)")).not.toBeInTheDocument();
	});

	test("collapsed array node shows 'Array(N)' preview", async () => {
		const { getAllByRole, getByText } = await render(JSONOutput, {
			...default_props,
			value: [1, 2, 3, 4]
		});
		const collapse_btn = getAllByRole("button", { name: "Collapse" })[0];
		await fireEvent.click(collapse_btn);
		expect(getByText("Array(4)")).toBeVisible();
	});

	test("clicking preview text expands a collapsed node", async () => {
		const { getAllByRole, getByText } = await render(JSONOutput, {
			...default_props,
			value: { name: "Alice", age: 30 }
		});
		// Collapse first
		const collapse_btn = getAllByRole("button", { name: "Collapse" })[0];
		await fireEvent.click(collapse_btn);
		// Click the preview button to expand
		const preview = getByText(/Object\(\d+\)/);
		await fireEvent.click(preview);
		expect(getByText('"name"')).toBeVisible();
	});

	test("primitive value has no toggle button", async () => {
		const { queryByRole } = await render(JSONOutput, {
			...default_props,
			value: "just a string"
		});
		expect(queryByRole("button", { name: "Collapse" })).not.toBeInTheDocument();
		expect(queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
	});

	test.todo(
		"VISUAL: interactive=false disables toggle buttons — test via BaseJSON with interactive=false prop directly; Index.svelte does not plumb interactive through to JSONNode"
	);
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: fired when value updates via set_data", async () => {
		const { listen, set_data } = await render(JSONOutput, default_props);
		const change = listen("change");
		await set_data({ value: { updated: true } });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change: not fired again without a value update", async () => {
		const { listen } = await render(JSONOutput, default_props);
		// Non-retrospective: only captures events fired AFTER this point.
		// Verifies no spurious change fires after mount without a data change.
		const change = listen("change");
		expect(change).not.toHaveBeenCalled();
	});

	test("change: same primitive value set twice fires only once", async () => {
		const { listen, set_data } = await render(JSONOutput, {
			...default_props,
			value: { initial: true }
		});
		const change = listen("change");
		await set_data({ value: "hello" });
		await set_data({ value: "hello" });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("custom_button_click: fired with { id } when custom button clicked", async () => {
		const { listen, getByLabelText } = await render(JSONOutput, {
			...default_props,
			buttons: [{ value: "Action", id: 7, icon: null }]
		});
		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Action"));
		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 7 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("set_data with new object renders new content", async () => {
		const { set_data, getByText } = await render(JSONOutput, default_props);
		await set_data({ value: { foo: "bar" } });
		expect(getByText('"foo"')).toBeVisible();
		expect(getByText('"bar"')).toBeVisible();
	});

	test("set_data with null switches to Empty state", async () => {
		const { set_data, queryByLabelText } = await render(
			JSONOutput,
			default_props
		);
		await set_data({ value: null });
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
	});

	test("set_data with empty object switches to Empty state", async () => {
		const { set_data, queryByLabelText } = await render(
			JSONOutput,
			default_props
		);
		await set_data({ value: {} });
		expect(queryByLabelText("Copy")).not.toBeInTheDocument();
	});

	test("set_data then get_data round-trip preserves value", async () => {
		const { set_data, get_data } = await render(JSONOutput, default_props);
		const test_value = { x: 42, y: "hello", z: [1, 2, 3] };
		await set_data({ value: test_value });
		const data = await get_data();
		expect(data.value).toEqual(test_value);
	});
});

test.todo(
	"VISUAL: theme_mode='dark' applies dark-mode CSS variables (--bracket-color, --number-color) to JSONNode — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: theme_mode='light' applies light-mode CSS colors to JSONNode — needs Playwright visual regression screenshot comparison"
);
