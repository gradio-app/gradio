import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import { tick } from "svelte";

import Slider from "./Index.svelte";

const loading_status = {
	status: "complete" as const,
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full" as const,
	type: "input" as const,
	stream_state: "closed" as const
};

const default_props = {
	value: 5,
	minimum: 0,
	maximum: 10,
	step: 1,
	label: "Slider",
	show_label: true,
	interactive: true,
	buttons: null as string[] | null,
	info: undefined as string | undefined,
	loading_status
};

run_shared_prop_tests({
	component: Slider,
	name: "Slider",
	base_props: {
		...default_props
	},
	has_label: true,
	has_validation_error: false
});

describe("Slider", () => {
	afterEach(() => cleanup());

	test("renders with value displayed in number input", async () => {
		const { getByTestId } = await render(Slider, {
			...default_props,
			value: 7
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;
		expect(number_input).toBeTruthy();
		expect(number_input.value).toBe("7");
	});

	test("renders range input with correct min, max, and step", async () => {
		const { container } = await render(Slider, {
			...default_props,
			minimum: 2,
			maximum: 20,
			step: 0.5
		});

		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;
		expect(range_input).toBeTruthy();
		expect(range_input.min).toBe("2");
		expect(range_input.max).toBe("20");
		expect(range_input.step).toBe("0.5");
	});

	test("displays min and max values", async () => {
		const { container } = await render(Slider, {
			...default_props,
			minimum: -10,
			maximum: 100
		});

		const min_span = container.querySelector(".min_value");
		const max_span = container.querySelector(".max_value");
		expect(min_span?.textContent).toBe("-10");
		expect(max_span?.textContent).toBe("100");
	});

	test("defaults label to 'Slider' when label is empty", async () => {
		const { getByText } = await render(Slider, {
			...default_props,
			label: ""
		});

		expect(getByText("Slider")).toBeTruthy();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true enables both inputs", async () => {
		const { container, getByTestId } = await render(Slider, {
			...default_props,
			interactive: true
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;
		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;

		expect(number_input.disabled).toBe(false);
		expect(range_input.disabled).toBe(false);
	});

	test("interactive=false disables both inputs", async () => {
		const { container, getByTestId } = await render(Slider, {
			...default_props,
			interactive: false
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;
		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;

		expect(number_input.disabled).toBe(true);
		expect(range_input.disabled).toBe(true);
	});

	test("interactive=false disables the reset button", async () => {
		const { getByTestId } = await render(Slider, {
			...default_props,
			interactive: false
		});

		const reset_btn = getByTestId("reset-button") as HTMLButtonElement;
		expect(reset_btn.disabled).toBe(true);
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("reset button is shown by default when buttons is null", async () => {
		const { getByTestId } = await render(Slider, {
			...default_props,
			buttons: null
		});

		expect(getByTestId("reset-button")).toBeTruthy();
	});

	test("reset button is shown when buttons includes 'reset'", async () => {
		const { getByTestId } = await render(Slider, {
			...default_props,
			buttons: ["reset"]
		});

		expect(getByTestId("reset-button")).toBeTruthy();
	});

	test("reset button is hidden when buttons is empty array", async () => {
		const { queryByTestId } = await render(Slider, {
			...default_props,
			buttons: []
		});

		expect(queryByTestId("reset-button")).toBeNull();
	});

	test("reset button is hidden when buttons does not include 'reset'", async () => {
		const { queryByTestId } = await render(Slider, {
			...default_props,
			buttons: ["other"]
		});

		expect(queryByTestId("reset-button")).toBeNull();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("setting value triggers change event", async () => {
		const { listen, set_data } = await render(Slider, {
			...default_props,
			value: 5
		});

		const change = listen("change");

		await set_data({ value: 8 });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change event is not triggered on mount with a default value", async () => {
		const { listen } = await render(Slider, {
			...default_props,
			value: 5
		});

		const change = listen("change");
		await tick();
		await tick();

		expect(change).not.toHaveBeenCalled();
	});

	test("changing value multiple times triggers change each time", async () => {
		const { listen, set_data } = await render(Slider, {
			...default_props,
			value: 0
		});

		const change = listen("change");

		await set_data({ value: 3 });
		await set_data({ value: 7 });
		await set_data({ value: 10 });

		expect(change).toHaveBeenCalledTimes(3);
	});

	test("setting same value does not trigger change", async () => {
		const { listen, set_data } = await render(Slider, {
			...default_props,
			value: 5
		});

		const change = listen("change");

		await set_data({ value: 5 });

		expect(change).not.toHaveBeenCalled();
	});
});

describe("Events: input", () => {
	afterEach(() => cleanup());

	test("typing in number input fires input event", async () => {
		const { getByTestId, listen } = await render(Slider, {
			...default_props,
			value: 5
		});

		const input = listen("input");
		const number_input = getByTestId("number-input") as HTMLInputElement;

		await fireEvent.input(number_input, { target: { value: "8" } });

		expect(input).toHaveBeenCalledTimes(1);
	});

	test("moving range slider fires input event", async () => {
		const { container, listen } = await render(Slider, {
			...default_props,
			value: 5
		});

		const input = listen("input");
		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;

		await fireEvent.input(range_input, { target: { value: "8" } });

		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("Events: release", () => {
	afterEach(() => cleanup());

	test("pointerup on range input fires release event with value", async () => {
		const { container, listen } = await render(Slider, {
			...default_props,
			value: 5
		});

		const release = listen("release");
		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;

		await fireEvent.pointerUp(range_input);

		expect(release).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledWith(5);
	});

	test("pointerup on number input fires release event", async () => {
		const { getByTestId, listen } = await render(Slider, {
			...default_props,
			value: 3
		});

		const release = listen("release");
		const number_input = getByTestId("number-input") as HTMLInputElement;

		await fireEvent.pointerUp(number_input);

		expect(release).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledWith(3);
	});

	test("blur on number input fires release event via clamp", async () => {
		const { getByTestId, listen } = await render(Slider, {
			...default_props,
			value: 5
		});

		const release = listen("release");
		const number_input = getByTestId("number-input") as HTMLInputElement;

		await fireEvent.blur(number_input);

		expect(release).toHaveBeenCalledTimes(1);
	});
});

describe("Value clamping", () => {
	afterEach(() => cleanup());

	test("value above maximum is clamped on number input blur", async () => {
		const { getByTestId, get_data } = await render(Slider, {
			...default_props,
			value: 5,
			minimum: 0,
			maximum: 10
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;

		await fireEvent.input(number_input, { target: { value: "15" } });
		await fireEvent.blur(number_input);

		const data = await get_data();
		expect(data.value).toBe(10);
	});

	test("value below minimum is clamped on number input blur", async () => {
		const { getByTestId, get_data } = await render(Slider, {
			...default_props,
			value: 5,
			minimum: 0,
			maximum: 10
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;

		await fireEvent.input(number_input, { target: { value: "-5" } });
		await fireEvent.blur(number_input);

		const data = await get_data();
		expect(data.value).toBe(0);
	});

	test("value within range is not clamped", async () => {
		const { getByTestId, get_data } = await render(Slider, {
			...default_props,
			value: 5,
			minimum: 0,
			maximum: 10
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;

		await fireEvent.input(number_input, { target: { value: "7" } });
		await fireEvent.blur(number_input);

		const data = await get_data();
		expect(data.value).toBe(7);
	});
});

describe("Reset button", () => {
	afterEach(() => cleanup());

	test("clicking reset restores the initial value", async () => {
		const { getByTestId, set_data, get_data } = await render(Slider, {
			...default_props,
			value: 5
		});

		await set_data({ value: 9 });

		const reset_btn = getByTestId("reset-button");
		await fireEvent.click(reset_btn);

		const data = await get_data();
		expect(data.value).toBe(5);
	});

	test("clicking reset dispatches change and release events", async () => {
		const { getByTestId, listen, set_data } = await render(Slider, {
			...default_props,
			value: 5
		});

		await set_data({ value: 9 });

		const change = listen("change");
		const release = listen("release");

		const reset_btn = getByTestId("reset-button");
		await fireEvent.click(reset_btn);

		expect(change).toHaveBeenCalled();
		expect(release).toHaveBeenCalled();
		expect(release).toHaveBeenCalledWith(5);
	});
});

describe("Number input and range input sync", () => {
	afterEach(() => cleanup());

	test("number input reflects the current value", async () => {
		const { getByTestId, set_data } = await render(Slider, {
			...default_props,
			value: 3
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;
		expect(number_input.value).toBe("3");

		await set_data({ value: 8 });

		expect(number_input.value).toBe("8");
	});

	test("range input reflects the current value", async () => {
		const { container, set_data } = await render(Slider, {
			...default_props,
			value: 3
		});

		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;
		expect(range_input.value).toBe("3");

		await set_data({ value: 8 });

		expect(range_input.value).toBe("8");
	});
});

describe("Accessibility", () => {
	afterEach(() => cleanup());

	test("number input has correct aria-label", async () => {
		const { getByTestId } = await render(Slider, {
			...default_props,
			label: "Volume"
		});

		const number_input = getByTestId("number-input") as HTMLInputElement;
		expect(number_input.getAttribute("aria-label")).toBe(
			"number input for Volume"
		);
	});

	test("range input has correct aria-label", async () => {
		const { container } = await render(Slider, {
			...default_props,
			label: "Volume"
		});

		const range_input = container.querySelector(
			'input[type="range"]'
		) as HTMLInputElement;
		expect(range_input.getAttribute("aria-label")).toBe(
			"range slider for Volume"
		);
	});

	test("reset button has aria-label", async () => {
		const { getByTestId } = await render(Slider, {
			...default_props
		});

		const reset_btn = getByTestId("reset-button");
		expect(reset_btn.getAttribute("aria-label")).toBe(
			"Reset to default value"
		);
	});
});
