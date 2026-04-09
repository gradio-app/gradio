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

	test("zero is rendered correctly", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 0
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el.valueAsNumber).toBe(0);
		expect(el.value).toBe("0");
	});

	test("undefined renders empty input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: undefined
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el.value).toBe("");
	});

	test("negative numbers are preserved", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: -42
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el.valueAsNumber).toBe(-42);
	});

	test("decimal numbers are preserved", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 3.14159
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el.valueAsNumber).toBe(3.14159);
	});
});

describe("Props: limits", () => {
	afterEach(() => cleanup());

	test("step up increments by step", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 0,
			step: 5
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.stepUp();
		await fireEvent.input(el);

		await waitFor(() => {
			expect(el.valueAsNumber).toBe(5);
		});
	});

	test("step down decrements by step", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 10,
			step: 5
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.stepDown();
		await fireEvent.input(el);

		await waitFor(() => {
			expect(el.valueAsNumber).toBe(5);
		});
	});

	test("step down does not go below minimum", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 0,
			minimum: 0,
			step: 1
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.stepDown();
		await fireEvent.input(el);

		await waitFor(() => {
			expect(el.valueAsNumber).toBeGreaterThanOrEqual(0);
		});
	});

	test("step up does not exceed maximum", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 100,
			maximum: 100,
			step: 1
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.stepUp();

		await fireEvent.input(el);

		await waitFor(() => {
			expect(el.valueAsNumber).toBeLessThanOrEqual(100);
		});
	});

	test("out-of-bounds value via set_data is flagged as invalid", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 50,
			minimum: 0,
			maximum: 100
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.value = "200";
		await fireEvent.input(el);

		expect(el.validity.rangeOverflow).toBe(true);
	});

	test("below-minimum value via user input is flagged as invalid", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 50,
			minimum: 0,
			maximum: 100
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.value = "-5";
		await fireEvent.input(el);

		expect(el.validity.rangeUnderflow).toBe(true);
	});
});

describe("Validation error", () => {
	afterEach(() => cleanup());

	test("validation error is displayed when set via loading_status", async () => {
		const { getByText } = await render(Number, {
			...default_props,
			loading_status: {
				status: "complete",
				validation_error: "Value must be between 0 and 100"
			}
		});

		getByText("Value must be between 0 and 100");
	});

	test("input has validation-error class when error is present", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			loading_status: {
				status: "complete",
				validation_error: "Invalid"
			}
		});

		const el = getByLabelText("Number");
		expect(el).toHaveClass("validation-error");
	});

	test("no validation error when loading_status has no error", async () => {
		const { queryByText } = await render(Number, {
			...default_props,
			loading_status: {
				status: "complete",
				validation_error: null
			}
		});

		expect(queryByText("Value must be between 0 and 100")).toBeNull();
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("buttons are rendered when provided", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			buttons: [{ value: "Randomize", id: 1, icon: null }]
		});

		getByLabelText("Randomize");
	});

	test("no buttons rendered when empty array", async () => {
		const { queryByRole } = await render(Number, {
			...default_props,
			buttons: []
		});

		expect(queryByRole("button")).toBeNull();
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

	test("info is not rendered when not provided", async () => {
		const { queryByText } = await render(Number, {
			...default_props,
			info: undefined
		});

		expect(queryByText("Must be between 0 and 100")).toBeNull();
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

	test("set_data updates the value in the UI", async () => {
		const { set_data, getByLabelText } = await render(Number, {
			...default_props,
			value: 0
		});

		await set_data({ value: 999 });

		const el = getByLabelText("Number") as HTMLInputElement;
		expect(el.valueAsNumber).toBe(999);
	});

	test("user input is reflected in get_data", async () => {
		const { getByLabelText, get_data } = await render(Number, {
			...default_props,
			value: null
		});

		const el = getByLabelText("Number") as HTMLInputElement;
		el.focus();
		await event.type(el, "42");

		await waitFor(async () => {
			const data = await get_data();
			expect(data.value).toBe(42);
		});
	});
});
