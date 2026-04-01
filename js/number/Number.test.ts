import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Number from "./Index.svelte";

const default_props = {
	show_label: true,
	value: 42,
	label: "Number",
	interactive: true
};

run_shared_prop_tests({
	component: Number,
	name: "Number",
	base_props: {
		value: 0,
		interactive: true
	},
	has_validation_error: false
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Number, {
			...default_props,
			value: 7
		});

		const item = getByDisplayValue("7") as HTMLInputElement;
		expect(item.value).toBe("7");
	});

	test("renders input with type=number", async () => {
		const { getByLabelText } = await render(Number, default_props);

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el).toHaveAttribute("type", "number");
	});

	test("null value renders empty input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: null
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el.value).toBe("");
	});
});

describe("Props: limits", () => {
	afterEach(() => cleanup());

	test("minimum is applied to the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			minimum: 0
		});

		const el = getByLabelText("Number");
		expect(el).toHaveAttribute("min", "0");
	});

	test("maximum is applied to the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			maximum: 100
		});

		const el = getByLabelText("Number");
		expect(el).toHaveAttribute("max", "100");
	});

	test("step is applied to the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			step: 5
		});

		const el = getByLabelText("Number");
		expect(el).toHaveAttribute("step", "5");
	});
});

describe("Props: text", () => {
	afterEach(() => cleanup());

	test("placeholder text is rendered", async () => {
		const { getByPlaceholderText } = await render(Number, {
			...default_props,
			value: null,
			placeholder: "Enter a number..."
		});

		getByPlaceholderText("Enter a number...");
	});

	test("info renders descriptive text", async () => {
		const { getByText } = await render(Number, {
			...default_props,
			info: "Must be between 0 and 100"
		});

		getByText("Must be between 0 and 100");
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=false disables the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			interactive: false
		});

		const el = getByLabelText("Number");
		expect(el).toBeDisabled();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change emitted when value changes via set_data", async () => {
		const { listen, set_data } = await render(Number, default_props);

		const change = listen("change");
		await set_data({ value: 99 });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change event does not fire on mount", async () => {
		const { listen } = await render(Number, default_props);

		const change = listen("change");
		expect(change).not.toHaveBeenCalled();
	});

	test("change deduplication: same value does not re-fire", async () => {
		const { listen, set_data } = await render(Number, {
			...default_props,
			value: 0
		});

		const change = listen("change");
		await set_data({ value: 50 });
		await set_data({ value: 50 });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("input emitted on keystroke", async () => {
		const { getByLabelText, listen } = await render(Number, {
			...default_props,
			value: null
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		const input = listen("input");

		el.focus();
		await event.type(el, "5");

		await waitFor(() => {
			expect(input).toHaveBeenCalled();
		});
	});

	test("submit emitted on Enter key", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const el = getByLabelText("Number") as HTMLInputElement;
		const submit = listen("submit");

		el.focus();
		await event.keyboard("{Enter}");

		expect(submit).toHaveBeenCalledTimes(1);
	});

	test("blur emitted when input loses focus", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const el = getByLabelText("Number");
		const blur = listen("blur");

		el.focus();
		el.blur();

		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("focus emitted when input gains focus", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const el = getByLabelText("Number");
		const focus = listen("focus");

		el.focus();

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("custom_button_click emitted when custom button is clicked", async () => {
		const { listen, getByLabelText } = await render(Number, {
			...default_props,
			buttons: [{ value: "Randomize", id: 7, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Randomize");
		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 7 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the current value", async () => {
		const { get_data } = await render(Number, {
			...default_props,
			value: 123
		});

		const data = await get_data();
		expect(data.value).toBe(123);
	});

	test("set_data updates the current value", async () => {
		const { set_data, get_data } = await render(Number, default_props);

		await set_data({ value: 77 });
		const data = await get_data();
		expect(data.value).toBe(77);
	});
});
