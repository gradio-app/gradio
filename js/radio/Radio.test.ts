import { test, describe, expect, afterEach } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Radio from "./Index.svelte";

afterEach(cleanup);

const choices: [string, string][] = [
	["dog", "dog"],
	["cat", "cat"],
	["turtle", "turtle"]
];

const default_props = {
	show_label: true,
	choices,
	value: "cat",
	label: "Radio",
	interactive: true
};

run_shared_prop_tests({
	component: Radio,
	name: "Radio",
	base_props: {
		choices,
		value: "dog",
		interactive: true
	},
	has_validation_error: false
});

describe("Props: value", () => {
	test("renders provided value as checked", async () => {
		const { getAllByRole } = await render(Radio, default_props);

		const radios = getAllByRole("radio") as HTMLInputElement[];
		expect(radios).toHaveLength(3);
		expect(radios[0]).not.toBeChecked();
		expect(radios[1]).toBeChecked();
		expect(radios[2]).not.toBeChecked();
	});

	test("null value renders no radio checked", async () => {
		const { getAllByRole } = await render(Radio, {
			...default_props,
			value: null
		});

		const radios = getAllByRole("radio") as HTMLInputElement[];
		radios.forEach((radio) => {
			expect(radio).not.toBeChecked();
		});
	});

	test("undefined value renders no radio checked", async () => {
		const { getAllByRole } = await render(Radio, {
			...default_props,
			value: undefined
		});

		const radios = getAllByRole("radio") as HTMLInputElement[];
		radios.forEach((radio) => {
			expect(radio).not.toBeChecked();
		});
	});

	test("value not in choices renders no radio checked", async () => {
		const { getAllByRole } = await render(Radio, {
			...default_props,
			value: "fish"
		});

		const radios = getAllByRole("radio") as HTMLInputElement[];
		radios.forEach((radio) => {
			expect(radio).not.toBeChecked();
		});
	});

	test("numeric values are supported in choices", async () => {
		const numeric_choices: [string, number][] = [
			["one", 1],
			["two", 2],
			["three", 3]
		];

		const { getAllByRole } = await render(Radio, {
			...default_props,
			choices: numeric_choices,
			value: 2
		});

		const radios = getAllByRole("radio") as HTMLInputElement[];
		expect(radios[1]).toBeChecked();
	});
});

describe("Props: choices", () => {
	test("renders display values as labels", async () => {
		const { getByText } = await render(Radio, default_props);

		expect(getByText("dog")).toBeVisible();
		expect(getByText("cat")).toBeVisible();
		expect(getByText("turtle")).toBeVisible();
	});

	test("display value and internal value can differ", async () => {
		const custom_choices: [string, string][] = [
			["dog label", "dog_val"],
			["cat label", "cat_val"]
		];

		const { getByText, getAllByRole, get_data } = await render(Radio, {
			...default_props,
			choices: custom_choices,
			value: "cat_val"
		});

		expect(getByText("dog label")).toBeVisible();
		expect(getByText("cat label")).toBeVisible();

		const radios = getAllByRole("radio") as HTMLInputElement[];
		expect(radios[1]).toBeChecked();

		const data = await get_data();
		expect(data.value).toBe("cat_val");
	});

	test("empty choices renders no radios", async () => {
		const { queryAllByRole } = await render(Radio, {
			...default_props,
			choices: [],
			value: null
		});

		expect(queryAllByRole("radio")).toHaveLength(0);
	});
});

describe("Props: interactive", () => {
	test("interactive=false disables all radios", async () => {
		const { getAllByRole } = await render(Radio, {
			...default_props,
			interactive: false
		});

		const radios = getAllByRole("radio") as HTMLInputElement[];
		radios.forEach((radio) => {
			expect(radio).toBeDisabled();
		});
	});
});

describe("Props: info", () => {
	test("info renders descriptive text", async () => {
		const { getByText } = await render(Radio, {
			...default_props,
			info: "Pick your favorite animal"
		});

		expect(getByText("Pick your favorite animal")).toBeVisible();
	});

	test("no info does not render info text", async () => {
		const { queryByText } = await render(Radio, {
			...default_props,
			info: undefined
		});

		expect(queryByText("Pick your favorite animal")).toBeNull();
	});
});

describe("Props: buttons", () => {
	test("custom buttons are rendered when provided", async () => {
		const { getByLabelText } = await render(Radio, {
			...default_props,
			buttons: [{ value: "Shuffle", id: 1, icon: null }]
		});

		getByLabelText("Shuffle");
	});

	test("no buttons rendered when null", async () => {
		const { queryByRole } = await render(Radio, {
			...default_props,
			buttons: null
		});

		expect(queryByRole("button")).toBeNull();
	});
});

describe("Interactive behavior", () => {
	test("clicking through options selects and deselects correctly", async () => {
		const { getAllByRole } = await render(Radio, default_props);

		const radios = getAllByRole("radio") as HTMLInputElement[];
		expect(radios[1]).toBeChecked();

		await event.click(radios[0]);
		expect(radios[0]).toBeChecked();
		expect(radios[1]).not.toBeChecked();

		await event.click(radios[2]);
		expect(radios[2]).toBeChecked();
		expect(radios[0]).not.toBeChecked();

		await event.click(radios[1]);
		expect(radios[1]).toBeChecked();
		expect(radios[2]).not.toBeChecked();
	});

	test("multiple radio instances on the same page do not conflict", async () => {
		const { container } = await render(Radio, {
			...default_props,
			value: "cat"
		});

		const { getAllByLabelText } = await render(
			Radio,
			{
				...default_props,
				value: "dog"
			},
			{ container: container as HTMLElement }
		);

		const items = getAllByLabelText("dog") as HTMLInputElement[];
		expect([items[0].checked, items[1].checked]).toEqual([false, true]);

		await event.click(items[0]);

		expect([items[0].checked, items[1].checked]).toEqual([true, true]);
	});
});

describe("Events", () => {
	test("change emitted when value changes via set_data", async () => {
		const { listen, set_data } = await render(Radio, default_props);

		const change = listen("change");
		await set_data({ value: "dog" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change event does not fire on mount", async () => {
		const { listen } = await render(Radio, default_props);

		const change = listen("change");

		expect(change).not.toHaveBeenCalled();
	});

	test("change deduplication: same value does not re-fire", async () => {
		const { listen, set_data } = await render(Radio, {
			...default_props,
			value: "dog"
		});

		const change = listen("change");
		await set_data({ value: "cat" });
		await set_data({ value: "cat" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("custom_button_click emitted when custom button is clicked", async () => {
		const { listen, getByLabelText } = await render(Radio, {
			...default_props,
			buttons: [{ value: "Shuffle", id: 5, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Shuffle");
		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 5 });
	});
});

describe("get_data / set_data", () => {
	test("get_data returns the current value", async () => {
		const { get_data } = await render(Radio, {
			...default_props,
			value: "turtle"
		});

		const data = await get_data();
		expect(data.value).toBe("turtle");
	});

	test("set_data updates the value", async () => {
		const { set_data, get_data } = await render(Radio, default_props);

		await set_data({ value: "dog" });

		const data = await get_data();
		expect(data.value).toBe("dog");
	});

	test("set_data to null clears the value", async () => {
		const { set_data, get_data } = await render(Radio, default_props);

		await set_data({ value: null });

		const data = await get_data();
		expect(data.value).toBeNull();
	});
});
