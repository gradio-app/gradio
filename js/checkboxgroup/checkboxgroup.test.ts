import { test, describe, expect, afterEach } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import CheckboxGroup from "./Index.svelte";

const default_props = {
	label: "Options",
	show_label: true,
	value: [] as (string | number)[],
	choices: [
		["Choice One", "one"],
		["Choice Two", "two"],
		["Choice Three", "three"]
	] as [string, string | number][],
	interactive: true,
	info: "",
	show_select_all: false
};

// CheckboxGroup uses BlockTitle (not BlockLabel) and doesn't use
// StatusTracker's validation_error, so disable both.
run_shared_prop_tests({
	component: CheckboxGroup,
	name: "CheckboxGroup",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false
});

// ── Basic rendering ──────────────────────────────────────────────────

describe("CheckboxGroup", () => {
	afterEach(() => cleanup());

	test("renders all choices as checkboxes", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props
		});

		expect(getByLabelText("Choice One")).toBeTruthy();
		expect(getByLabelText("Choice Two")).toBeTruthy();
		expect(getByLabelText("Choice Three")).toBeTruthy();
	});

	test("renders correct checked state for string values", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: ["one", "three"]
		});

		expect(getByLabelText("Choice One")).toBeChecked();
		expect(getByLabelText("Choice Two")).not.toBeChecked();
		expect(getByLabelText("Choice Three")).toBeChecked();
	});

	test("renders correct checked state for number values", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			choices: [
				["A", 1],
				["B", 2],
				["C", 3]
			],
			value: [1, 3]
		});

		expect(getByLabelText("A")).toBeChecked();
		expect(getByLabelText("B")).not.toBeChecked();
		expect(getByLabelText("C")).toBeChecked();
	});

	test("empty value renders all unchecked", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: []
		});

		expect(getByLabelText("Choice One")).not.toBeChecked();
		expect(getByLabelText("Choice Two")).not.toBeChecked();
		expect(getByLabelText("Choice Three")).not.toBeChecked();
	});

	test("value that does not match any choice leaves all unchecked", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: ["nonexistent"]
		});

		expect(getByLabelText("Choice One")).not.toBeChecked();
		expect(getByLabelText("Choice Two")).not.toBeChecked();
		expect(getByLabelText("Choice Three")).not.toBeChecked();
	});
});

// ── Props: interactive ───────────────────────────────────────────────

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true allows toggling choices", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			interactive: true,
			value: []
		});

		const cb = getByLabelText("Choice One");
		await event.click(cb);
		expect(cb).toBeChecked();
	});

	test("interactive=false disables all checkboxes", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			interactive: false,
			value: []
		});

		expect(getByLabelText("Choice One")).toBeDisabled();
		expect(getByLabelText("Choice Two")).toBeDisabled();
		expect(getByLabelText("Choice Three")).toBeDisabled();
	});

	test("interactive=false prevents toggling", async () => {
		const { getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			interactive: false,
			value: []
		});

		await event.click(getByLabelText("Choice One"));
		expect(getByLabelText("Choice One")).not.toBeChecked();
	});
});

// ── Props: show_select_all ───────────────────────────────────────────

describe("Props: show_select_all", () => {
	afterEach(() => cleanup());

	test("show_select_all=true renders select all button", async () => {
		const { getByRole } = await render(CheckboxGroup, {
			...default_props,
			show_select_all: true
		});

		expect(getByRole("button", { name: "Options" })).toBeTruthy();
	});

	test("clicking select all checks all choices", async () => {
		const { getByRole, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			show_select_all: true,
			value: []
		});

		await fireEvent.click(getByRole("button", { name: "Options" }));

		expect(getByLabelText("Choice One")).toBeChecked();
		expect(getByLabelText("Choice Two")).toBeChecked();
		expect(getByLabelText("Choice Three")).toBeChecked();
	});

	test("clicking select all when all checked unchecks all", async () => {
		const { getByRole, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			show_select_all: true,
			value: ["one", "two", "three"]
		});

		await fireEvent.click(getByRole("button", { name: "Options" }));

		expect(getByLabelText("Choice One")).not.toBeChecked();
		expect(getByLabelText("Choice Two")).not.toBeChecked();
		expect(getByLabelText("Choice Three")).not.toBeChecked();
	});

	test("clicking select all when some checked selects all", async () => {
		const { getByRole, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			show_select_all: true,
			value: ["one"]
		});

		await fireEvent.click(getByRole("button", { name: "Options" }));

		expect(getByLabelText("Choice One")).toBeChecked();
		expect(getByLabelText("Choice Two")).toBeChecked();
		expect(getByLabelText("Choice Three")).toBeChecked();
	});

	test("show_select_all=false does not render select all button", async () => {
		const { queryByTitle } = await render(CheckboxGroup, {
			...default_props,
			show_select_all: false
		});

		expect(queryByTitle("Select/Deselect All")).toBeNull();
	});
});

// ── Events: change ───────────────────────────────────────────────────

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("clicking a choice dispatches change with updated value", async () => {
		const { listen, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		const change = listen("change");
		await fireEvent.click(getByLabelText("Choice One"));

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith(["one"]);
	});

	test("unchecking a choice dispatches change without that value", async () => {
		const { listen, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: ["one", "two"],
			interactive: true
		});

		const change = listen("change");
		await fireEvent.click(getByLabelText("Choice One"));

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith(["two"]);
	});

	test("set_data triggers change event", async () => {
		const { listen, set_data } = await render(CheckboxGroup, {
			...default_props,
			value: []
		});

		const change = listen("change");
		await set_data({ value: ["one"] });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("no spurious change on mount", async () => {
		const { listen } = await render(CheckboxGroup, {
			...default_props,
			value: ["one"]
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("set_data with same value does not trigger change", async () => {
		const { listen, set_data } = await render(CheckboxGroup, {
			...default_props,
			value: ["one"]
		});

		const change = listen("change");
		await set_data({ value: ["one"] });

		expect(change).not.toHaveBeenCalled();
	});
});

// ── Events: input ────────────────────────────────────────────────────

describe("Events: input", () => {
	afterEach(() => cleanup());

	test("clicking a choice dispatches input event", async () => {
		const { listen, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		const input = listen("input");
		await fireEvent.click(getByLabelText("Choice Two"));

		expect(input).toHaveBeenCalledTimes(1);
	});

	test("select all dispatches input event", async () => {
		const { listen, getByRole } = await render(CheckboxGroup, {
			...default_props,
			show_select_all: true,
			value: [],
			interactive: true
		});

		const input = listen("input");
		await fireEvent.click(getByRole("button", { name: "Options" }));

		expect(input).toHaveBeenCalledTimes(1);
	});
});

// ── Events: select ───────────────────────────────────────────────────

describe("Events: select", () => {
	afterEach(() => cleanup());

	test("clicking a choice dispatches select with index and value", async () => {
		const { listen, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		const select = listen("select");
		await fireEvent.click(getByLabelText("Choice Two"));

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({ index: 1, value: "two", selected: true })
		);
	});

	test("unchecking dispatches select with selected=false", async () => {
		const { listen, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: ["two"],
			interactive: true
		});

		const select = listen("select");
		await fireEvent.click(getByLabelText("Choice Two"));

		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({ index: 1, value: "two", selected: false })
		);
	});
});

// ── Events: custom_button_click ──────────────────────────────────────

describe("Events: custom_button_click", () => {
	afterEach(() => cleanup());

	test("custom button dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Help", id: 5, icon: null }]
		});

		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Help"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 5 });
	});
});

// ── get_data / set_data ──────────────────────────────────────────────

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns current value", async () => {
		const { get_data } = await render(CheckboxGroup, {
			...default_props,
			value: ["one", "three"]
		});

		const data = await get_data();
		expect(data.value).toEqual(["one", "three"]);
	});

	test("set_data updates the checkboxes", async () => {
		const { set_data, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: []
		});

		await set_data({ value: ["two"] });

		expect(getByLabelText("Choice One")).not.toBeChecked();
		expect(getByLabelText("Choice Two")).toBeChecked();
		expect(getByLabelText("Choice Three")).not.toBeChecked();
	});

	test("round-trip: set_data then get_data", async () => {
		const { set_data, get_data } = await render(CheckboxGroup, {
			...default_props,
			value: []
		});

		await set_data({ value: ["one", "two"] });
		const data = await get_data();
		expect(data.value).toEqual(["one", "two"]);
	});

	test("user click reflected in get_data", async () => {
		const { get_data, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		await fireEvent.click(getByLabelText("Choice Three"));
		const data = await get_data();
		expect(data.value).toEqual(["three"]);
	});

	test("multiple user clicks accumulate in get_data", async () => {
		const { get_data, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		await fireEvent.click(getByLabelText("Choice One"));
		await fireEvent.click(getByLabelText("Choice Three"));
		const data = await get_data();
		expect(data.value).toEqual(["one", "three"]);
	});
});

// ── Keyboard interaction ─────────────────────────────────────────────

describe("Keyboard interaction", () => {
	afterEach(() => cleanup());

	test("Enter key toggles a checkbox and dispatches events", async () => {
		const { listen, getByLabelText, get_data } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		const select = listen("select");
		const change = listen("change");
		const cb = getByLabelText("Choice One");

		await fireEvent.keyDown(cb, { key: "Enter" });

		expect(select).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledTimes(1);
		const data = await get_data();
		expect(data.value).toEqual(["one"]);
	});
});

// ── Edge cases ───────────────────────────────────────────────────────

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("toggling same choice twice returns to original state", async () => {
		const { get_data, getByLabelText } = await render(CheckboxGroup, {
			...default_props,
			value: [],
			interactive: true
		});

		await fireEvent.click(getByLabelText("Choice One"));
		await fireEvent.click(getByLabelText("Choice One"));

		const data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("choices with display value different from internal value", async () => {
		const { getByLabelText, get_data } = await render(CheckboxGroup, {
			...default_props,
			choices: [
				["Displayed Label", "internal_val"],
				["Another Label", 42]
			],
			value: ["internal_val"],
			interactive: true
		});

		// Display value is shown, internal value is stored
		expect(getByLabelText("Displayed Label")).toBeChecked();
		expect(getByLabelText("Another Label")).not.toBeChecked();

		const data = await get_data();
		expect(data.value).toEqual(["internal_val"]);
	});
});
