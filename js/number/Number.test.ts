import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import { tick } from "svelte";

import Number from "./Index.svelte";

const default_props = {
	value: 0,
	label: "Number",
	interactive: true,
	minimum: undefined,
	maximum: undefined,
	step: null,
	placeholder: "",
	info: undefined,
	buttons: null
};

run_shared_prop_tests({
	component: Number,
	name: "Number",
	base_props: {
		value: 0,
		interactive: true
	}
});

describe("Number", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 42,
			interactive: false
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("42");
	});

	test("renders with default value of 0", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 0
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("0");
	});

	test("renders null value as empty input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: null
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("renders negative value", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: -10
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("-10");
	});

	test("renders decimal value", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 3.14
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("3.14");
	});

	test("input has type number", async () => {
		const { getByLabelText } = await render(Number, default_props);

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toHaveAttribute("type", "number");
	});
});

describe("Props: label", () => {
	afterEach(() => cleanup());

	test("renders custom label", async () => {
		const { getByText, getByLabelText } = await render(Number, {
			...default_props,
			label: "Age"
		});

		expect(getByText("Age")).toBeTruthy();

		const input = getByLabelText("Age") as HTMLInputElement;
		expect(input).toBeTruthy();
	});

	test("renders default label when label is empty", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			label: ""
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toBeTruthy();
	});
});

describe("Props: constraints", () => {
	afterEach(() => cleanup());

	test("minimum is applied to the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			minimum: 0
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toHaveAttribute("min", "0");
	});

	test("maximum is applied to the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			maximum: 100
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toHaveAttribute("max", "100");
	});

	test("step is applied to the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			step: 0.5
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toHaveAttribute("step", "0.5");
	});

	test("minimum and maximum are both applied", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			minimum: 1,
			maximum: 10,
			step: 1
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toHaveAttribute("min", "1");
		expect(input).toHaveAttribute("max", "10");
		expect(input).toHaveAttribute("step", "1");
	});
});

describe("Props: placeholder", () => {
	afterEach(() => cleanup());

	test("placeholder text is rendered", async () => {
		const { getByPlaceholderText } = await render(Number, {
			...default_props,
			placeholder: "Enter a number..."
		});

		expect(getByPlaceholderText("Enter a number...")).toBeTruthy();
	});
});

describe("Props: info", () => {
	afterEach(() => cleanup());

	test("info renders descriptive text", async () => {
		const { getByText } = await render(Number, {
			...default_props,
			info: "Enter your age"
		});

		expect(getByText("Enter your age")).toBeTruthy();
	});
});

describe("Interactive behavior", () => {
	afterEach(() => cleanup());

	test("interactive=true enables the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			interactive: true
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toBeEnabled();
	});

	test("interactive=false disables the input", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			interactive: false
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input).toBeDisabled();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: emitted when value changes from outside", async () => {
		const { listen, set_data } = await render(Number, default_props);

		const change = listen("change");

		await set_data({ value: 42 });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change: not emitted when same value is set again", async () => {
		const { listen, set_data } = await render(Number, {
			...default_props,
			value: 5
		});

		const change = listen("change");

		await set_data({ value: 5 });

		expect(change).not.toHaveBeenCalled();
	});

	test("input: emitted on user input", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const input = getByLabelText("Number") as HTMLInputElement;
		const inputEvent = listen("input");

		input.focus();
		await fireEvent.input(input, { target: { value: "5" } });

		await waitFor(() => {
			expect(inputEvent).toHaveBeenCalled();
		});
	});

	test("submit: emitted on Enter key press", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const input = getByLabelText("Number") as HTMLInputElement;
		const submit = listen("submit");

		input.focus();
		await fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

		expect(submit).toHaveBeenCalledTimes(1);
	});

	test("blur: emitted when input loses focus", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const input = getByLabelText("Number") as HTMLInputElement;
		const blur = listen("blur");

		input.focus();
		await fireEvent.blur(input);

		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("focus: emitted when input gains focus", async () => {
		const { getByLabelText, listen } = await render(Number, default_props);

		const input = getByLabelText("Number") as HTMLInputElement;
		const focus = listen("focus");

		await fireEvent.focus(input);

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("no spurious change event on mount", async () => {
		const { listen } = await render(Number, {
			...default_props,
			value: 42
		});
		const change = listen("change");
		await tick();
		await tick();
		expect(change).not.toHaveBeenCalled();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("value defaults to 0 when undefined", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: undefined
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("0");
	});

	test("large numbers are rendered correctly", async () => {
		const { getByLabelText } = await render(Number, {
			...default_props,
			value: 999999999
		});

		const input = getByLabelText("Number") as HTMLInputElement;
		expect(input.value).toBe("999999999");
	});
});
