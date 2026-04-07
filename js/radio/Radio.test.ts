import { test, describe, expect, afterEach } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Radio from "./Index.svelte";

const choices: [string, string][] = [
	["Dog", "dog"],
	["Cat", "cat"],
	["Turtle", "turtle"]
];

const default_props = {
	label: "Pick an animal",
	show_label: true,
	value: "cat",
	choices,
	interactive: true
};

run_shared_prop_tests({
	component: Radio,
	name: "Radio",
	base_props: default_props,
	has_label: true,
	has_validation_error: false
});

describe("Radio", () => {
	afterEach(() => cleanup());

	test("renders all radio buttons from choices", async () => {
		const { getAllByRole } = await render(Radio, default_props);

		const radios = getAllByRole("radio");
		expect(radios.length).toBe(3);
	});

	test("renders the selected value as checked", async () => {
		const { getAllByRole } = await render(Radio, default_props);

		const radios = getAllByRole("radio");
		expect(radios[0]).not.toBeChecked();
		expect(radios[1]).toBeChecked();
		expect(radios[2]).not.toBeChecked();
	});

	test("renders display values as labels", async () => {
		const { getByText } = await render(Radio, default_props);

		expect(getByText("Dog")).toBeVisible();
		expect(getByText("Cat")).toBeVisible();
		expect(getByText("Turtle")).toBeVisible();
	});

	test("renders info text when provided", async () => {
		const { getByText } = await render(Radio, {
			...default_props,
			info: "Choose wisely"
		});

		expect(getByText("Choose wisely")).toBeVisible();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("allows selecting a different radio when interactive", async () => {
		const { getAllByRole } = await render(Radio, default_props);

		const radios = getAllByRole("radio");
		await fireEvent.click(radios[0]);

		expect(radios[0]).toBeChecked();
		expect(radios[1]).not.toBeChecked();
	});

	test("disables all inputs when interactive is false", async () => {
		const { getAllByRole } = await render(Radio, {
			...default_props,
			interactive: false
		});

		const radios = getAllByRole("radio");
		radios.forEach((radio) => {
			expect(radio).toBeDisabled();
		});
	});

	test("prevents selection when disabled", async () => {
		const { getAllByRole } = await render(Radio, {
			...default_props,
			interactive: false,
			value: "cat"
		});

		const radios = getAllByRole("radio");
		await event.click(radios[0]);

		expect(radios[0]).not.toBeChecked();
		expect(radios[1]).toBeChecked();
	});
});

describe("Props: rtl", () => {
	test.todo(
		"VISUAL: rtl=true applies right-to-left layout to radio labels — needs Playwright visual regression screenshot comparison"
	);
});

describe("Props: choices", () => {
	afterEach(() => cleanup());

	test("choices with different display and internal values", async () => {
		const { getAllByRole, getByText } = await render(Radio, {
			...default_props,
			choices: [
				["First", 1],
				["Second", 2]
			] as [string, number][],
			value: 1
		});

		expect(getByText("First")).toBeVisible();
		expect(getByText("Second")).toBeVisible();

		const radios = getAllByRole("radio");
		expect(radios[0]).toBeChecked();
		expect(radios[1]).not.toBeChecked();
	});

	test("empty choices renders no radio buttons", async () => {
		const { queryAllByRole } = await render(Radio, {
			...default_props,
			choices: [],
			value: null
		});

		expect(queryAllByRole("radio").length).toBe(0);
	});

	test("updating choices via set_data re-renders radios", async () => {
		const { getAllByRole, set_data } = await render(Radio, default_props);

		expect(getAllByRole("radio").length).toBe(3);

		await set_data({
			choices: [
				["A", "a"],
				["B", "b"]
			]
		});

		expect(getAllByRole("radio").length).toBe(2);
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("clicking a different radio dispatches change", async () => {
		const { listen, getAllByRole } = await render(Radio, default_props);

		const change = listen("change");
		await fireEvent.click(getAllByRole("radio")[0]);

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("clicking the already-selected radio does not dispatch change", async () => {
		const { listen, getAllByRole } = await render(Radio, default_props);

		const change = listen("change");
		await fireEvent.click(getAllByRole("radio")[1]); // Cat is already selected

		expect(change).not.toHaveBeenCalled();
	});

	test("set_data with new value triggers change", async () => {
		const { listen, set_data } = await render(Radio, default_props);

		const change = listen("change");
		await set_data({ value: "turtle" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("set_data with same value does not trigger change", async () => {
		const { listen, set_data } = await render(Radio, default_props);

		const change = listen("change");
		await set_data({ value: "cat" });

		expect(change).not.toHaveBeenCalled();
	});

	test("no spurious change event on mount", async () => {
		const { listen } = await render(Radio, default_props);

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});
});

describe("Events: input", () => {
	afterEach(() => cleanup());

	test("clicking a radio dispatches input event", async () => {
		const { listen, getAllByRole } = await render(Radio, default_props);

		const input = listen("input");
		await fireEvent.click(getAllByRole("radio")[0]);

		expect(input).toHaveBeenCalledTimes(1);
	});

	test("set_data does not dispatch input event", async () => {
		const { listen, set_data } = await render(Radio, default_props);

		const input = listen("input");
		await set_data({ value: "turtle" });

		expect(input).not.toHaveBeenCalled();
	});
});

describe("Events: select", () => {
	afterEach(() => cleanup());

	test("clicking a radio dispatches select with value and index", async () => {
		const { listen, getAllByRole } = await render(Radio, default_props);

		const select = listen("select");
		await fireEvent.click(getAllByRole("radio")[0]);

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({ value: "dog", index: 0 })
		);
	});

	test("clicking third option dispatches select with correct index", async () => {
		const { listen, getAllByRole } = await render(Radio, default_props);

		const select = listen("select");
		await fireEvent.click(getAllByRole("radio")[2]);

		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({ value: "turtle", index: 2 })
		);
	});

	test("set_data does not dispatch select event", async () => {
		const { listen, set_data } = await render(Radio, default_props);

		const select = listen("select");
		await set_data({ value: "dog" });

		expect(select).not.toHaveBeenCalled();
	});
});

describe("Events: custom_button_click", () => {
	afterEach(() => cleanup());

	test("custom button dispatches custom_button_click with id", async () => {
		const { listen, getByLabelText } = await render(Radio, {
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
		const { get_data } = await render(Radio, default_props);

		const data = await get_data();
		expect(data.value).toBe("cat");
	});

	test("set_data updates the selected radio", async () => {
		const { set_data, getAllByRole } = await render(Radio, default_props);

		await set_data({ value: "turtle" });

		const radios = getAllByRole("radio");
		expect(radios[2]).toBeChecked();
		expect(radios[1]).not.toBeChecked();
	});

	test("round-trip: set_data then get_data", async () => {
		const { set_data, get_data } = await render(Radio, default_props);

		await set_data({ value: "dog" });
		const data = await get_data();
		expect(data.value).toBe("dog");
	});

	test("user click reflected in get_data", async () => {
		const { get_data, getAllByRole } = await render(Radio, default_props);

		await fireEvent.click(getAllByRole("radio")[0]);
		const data = await get_data();
		expect(data.value).toBe("dog");
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("multiple Radio instances on same page do not conflict", async () => {
		const { container } = await render(Radio, {
			...default_props,
			value: "cat"
		});

		const { getAllByRole } = await render(
			Radio,
			{
				...default_props,
				value: "dog"
			},
			container
		);

		// "dog" labels: first instance unchecked, second instance checked
		const dogRadios = getAllByRole("radio").filter(
			(r: HTMLInputElement) => r.value === "dog"
		);
		expect(dogRadios[0]).not.toBeChecked();
		expect(dogRadios[1]).toBeChecked();

		// Click "dog" in the first instance
		await fireEvent.click(dogRadios[0]);

		// First instance now checked, second instance still checked
		expect(dogRadios[0]).toBeChecked();
		expect(dogRadios[1]).toBeChecked();
	});

	test("value not in choices does not match any choice", async () => {
		const { get_data } = await render(Radio, {
			...default_props,
			value: "fish"
		});

		// The internal value should still be "fish" even though no radio visually matches
		const data = await get_data();
		expect(data.value).toBe("fish");
	});
});
