import { test, describe, expect, afterEach } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Checkbox from "./Index.svelte";

const default_props = {
	label: "Accept terms",
	show_label: true,
	value: false,
	interactive: true,
	info: ""
};

// Checkbox doesn't use StatusTracker's validation_error prop
// (it has its own info prop instead), so disable validation tests.
run_shared_prop_tests({
	component: Checkbox,
	name: "Checkbox",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false
});

describe("Checkbox", () => {
	afterEach(() => cleanup());

	test("renders unchecked by default", async () => {
		const { getByTestId } = await render(Checkbox, {
			...default_props,
			value: false
		});

		expect(getByTestId("checkbox")).not.toBeChecked();
	});

	test("renders checked when value=true", async () => {
		const { getByTestId } = await render(Checkbox, {
			...default_props,
			value: true
		});

		expect(getByTestId("checkbox")).toBeChecked();
	});

	test("label text is visible when show_label=true", async () => {
		const { getByText } = await render(Checkbox, {
			...default_props,
			label: "My Checkbox",
			show_label: true
		});

		expect(getByText("My Checkbox")).toBeVisible();
	});

	test("label text is hidden when show_label=false", async () => {
		const { queryByText } = await render(Checkbox, {
			...default_props,
			label: "My Checkbox",
			show_label: false
		});

		expect(queryByText("My Checkbox")).toBeNull();
	});

	test("info text is rendered when provided", async () => {
		const { getByText } = await render(Checkbox, {
			...default_props,
			info: "This is required"
		});

		expect(getByText("This is required")).toBeVisible();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true allows clicking to toggle", async () => {
		const { getByTestId } = await render(Checkbox, {
			...default_props,
			value: false,
			interactive: true
		});

		const cb = getByTestId("checkbox");
		await fireEvent.click(cb);
		expect(cb).toBeChecked();
	});

	test("interactive=false disables the checkbox", async () => {
		const { getByTestId } = await render(Checkbox, {
			...default_props,
			value: false,
			interactive: false
		});

		expect(getByTestId("checkbox")).toBeDisabled();
	});

	test("interactive=false prevents toggling via user click", async () => {
		const { getByTestId } = await render(Checkbox, {
			...default_props,
			value: false,
			interactive: false
		});

		const cb = getByTestId("checkbox");
		// Use user-event (not fireEvent) which respects disabled attribute
		await event.click(cb);
		expect(cb).not.toBeChecked();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("clicking checkbox dispatches change with new value", async () => {
		const { listen, getByTestId } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const change = listen("change");
		await fireEvent.click(getByTestId("checkbox"));

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith(true);
	});

	test("unchecking dispatches change with false", async () => {
		const { listen, getByTestId } = await render(Checkbox, {
			...default_props,
			value: true
		});

		const change = listen("change");
		await fireEvent.click(getByTestId("checkbox"));

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith(false);
	});

	test("set_data triggers change event", async () => {
		const { listen, set_data } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const change = listen("change");
		await set_data({ value: true });

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith(true);
	});

	test("no spurious change on mount", async () => {
		const { listen } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("set_data with same value does not trigger change", async () => {
		const { listen, set_data } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const change = listen("change");
		await set_data({ value: false });

		expect(change).not.toHaveBeenCalled();
	});
});

describe("Events: input", () => {
	afterEach(() => cleanup());

	test("clicking checkbox dispatches input event", async () => {
		const { listen, getByTestId } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const input = listen("input");
		await fireEvent.click(getByTestId("checkbox"));

		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("Events: select", () => {
	afterEach(() => cleanup());

	test("clicking checkbox dispatches select with index and value", async () => {
		const { listen, getByTestId } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const select = listen("select");
		await fireEvent.click(getByTestId("checkbox"));

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({ index: 0, value: true, selected: true })
		);
	});

	test("unchecking dispatches select with selected=false", async () => {
		const { listen, getByTestId } = await render(Checkbox, {
			...default_props,
			value: true
		});

		const select = listen("select");
		await fireEvent.click(getByTestId("checkbox"));

		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({ selected: false })
		);
	});
});

describe("Events: custom_button_click", () => {
	afterEach(() => cleanup());

	test("custom button dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(Checkbox, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Info", id: 1, icon: null }]
		});

		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Info"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 1 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns current value", async () => {
		const { get_data } = await render(Checkbox, {
			...default_props,
			value: true
		});

		const data = await get_data();
		expect(data.value).toBe(true);
	});

	test("set_data updates the checkbox", async () => {
		const { set_data, getByTestId } = await render(Checkbox, {
			...default_props,
			value: false
		});

		await set_data({ value: true });
		expect(getByTestId("checkbox")).toBeChecked();
	});

	test("round-trip: set_data then get_data", async () => {
		const { set_data, get_data } = await render(Checkbox, {
			...default_props,
			value: false
		});

		await set_data({ value: true });
		const data = await get_data();
		expect(data.value).toBe(true);
	});

	test("user click reflected in get_data", async () => {
		const { get_data, getByTestId } = await render(Checkbox, {
			...default_props,
			value: false
		});

		await fireEvent.click(getByTestId("checkbox"));
		const data = await get_data();
		expect(data.value).toBe(true);
	});
});

describe("Keyboard interaction", () => {
	afterEach(() => cleanup());

	test("Enter key toggles checkbox and dispatches select", async () => {
		const { getByTestId, listen } = await render(Checkbox, {
			...default_props,
			value: false
		});

		const cb = getByTestId("checkbox");
		const select = listen("select");
		const change = listen("change");

		await fireEvent.keyDown(cb, { key: "Enter" });

		expect(select).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith(true);
	});
});
