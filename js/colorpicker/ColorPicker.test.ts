import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import ColorPicker from "./Index.svelte";

const default_props = {
	value: "#000000",
	label: "Color Picker",
	show_label: true,
	interactive: true,
	info: ""
};

run_shared_prop_tests({
	component: ColorPicker,
	name: "ColorPicker",
	base_props: { ...default_props },
	has_label: true,
	has_validation_error: true
});

// stub a fixed 100x100 rect because headless tests give zero-sized picker elements.
function mock_rect(element: Element): void {
	(element as HTMLElement).getBoundingClientRect = () =>
		({
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			right: 100,
			bottom: 100,
			x: 0,
			y: 0,
			toJSON: () => {}
		}) as DOMRect;
}

async function open_picker(
	result: Awaited<ReturnType<typeof render>>
): Promise<void> {
	const swatch = result.getByRole("button", { name: "Color Picker" });
	await fireEvent.click(swatch);
}

describe("ColorPicker", () => {
	afterEach(() => cleanup());

	test("renders with default value", async () => {
		const { getByRole } = await render(ColorPicker, default_props);
		expect(getByRole("button", { name: "Color Picker" })).toBeInTheDocument();
	});

	test("renders with custom value", async () => {
		const { get_data } = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		const data = await get_data();
		expect(data.value).toBe("#ff0000");
	});

	test("info text is displayed when provided", async () => {
		const { getByText } = await render(ColorPicker, {
			...default_props,
			info: "Pick a color"
		});
		expect(getByText("Pick a color")).toBeInTheDocument();
	});

	test("info text is not rendered when empty", async () => {
		const { queryByText } = await render(ColorPicker, {
			...default_props,
			info: ""
		});
		expect(queryByText("Pick a color")).not.toBeInTheDocument();
	});
});

describe("Dialog", () => {
	afterEach(() => cleanup());

	test("clicking the color swatch opens the picker", async () => {
		const result = await render(ColorPicker, default_props);

		expect(
			result.queryByRole("button", { name: "Hex" })
		).not.toBeInTheDocument();

		await open_picker(result);

		expect(result.getByRole("button", { name: "Hex" })).toBeInTheDocument();
	});

	test("clicking the swatch again closes the picker", async () => {
		const result = await render(ColorPicker, default_props);

		await open_picker(result);
		expect(result.getByRole("button", { name: "Hex" })).toBeInTheDocument();

		const swatch = result.getByRole("button", { name: "Color Picker" });
		await fireEvent.click(swatch);

		expect(
			result.queryByRole("button", { name: "Hex" })
		).not.toBeInTheDocument();
	});

	test("clicking outside the picker closes it", async () => {
		const result = await render(ColorPicker, default_props);

		await open_picker(result);
		expect(result.getByRole("button", { name: "Hex" })).toBeInTheDocument();

		await fireEvent.mouseDown(document.body);

		expect(
			result.queryByRole("button", { name: "Hex" })
		).not.toBeInTheDocument();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=false disables the swatch button", async () => {
		const { getByRole } = await render(ColorPicker, {
			...default_props,
			interactive: false
		});
		expect(getByRole("button", { name: "Color Picker" })).toBeDisabled();
	});

	test("interactive=true enables the swatch button", async () => {
		const { getByRole } = await render(ColorPicker, {
			...default_props,
			interactive: true
		});
		expect(getByRole("button", { name: "Color Picker" })).toBeEnabled();
	});
});

describe("Color gradient", () => {
	afterEach(() => cleanup());

	test("dragging dispatches input events", async () => {
		const result = await render(ColorPicker, default_props);
		const input = result.listen("input");

		await open_picker(result);

		const gradient = result.getByRole("slider", {
			name: "Saturation and brightness"
		});
		mock_rect(gradient);

		await fireEvent.mouseDown(gradient, { clientX: 50, clientY: 75 });
		await fireEvent.mouseMove(window, { clientX: 60, clientY: 70 });
		await fireEvent.mouseUp(window);

		expect(input).toHaveBeenCalled();
	});

	test("mouseup after dragging dispatches release with new value", async () => {
		const result = await render(ColorPicker, default_props);
		const release = result.listen("release");

		await open_picker(result);

		const gradient = result.getByRole("slider", {
			name: "Saturation and brightness"
		});
		mock_rect(gradient);

		await fireEvent.mouseDown(gradient, { clientX: 30, clientY: 20 });
		await fireEvent.mouseUp(window);

		expect(release).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledWith("#cc8f8f");
	});

	test("dragging updates get_data value", async () => {
		const result = await render(ColorPicker, default_props);

		await open_picker(result);

		const gradient = result.getByRole("slider", {
			name: "Saturation and brightness"
		});
		mock_rect(gradient);

		await fireEvent.mouseDown(gradient, { clientX: 80, clientY: 20 });
		await fireEvent.mouseUp(window);

		const data = await result.get_data();
		expect(data.value).toBe("#cc2929");
	});

	test("mouseup without prior drag does not dispatch release", async () => {
		const result = await render(ColorPicker, default_props);
		const release = result.listen("release");

		await fireEvent.mouseUp(window);

		expect(release).not.toHaveBeenCalled();
	});
});

describe("Hue slider", () => {
	afterEach(() => cleanup());

	test("dragging dispatches input events", async () => {
		const result = await render(ColorPicker, default_props);
		const input = result.listen("input");

		await open_picker(result);

		const hue = result.getByRole("slider", { name: "Hue" });
		mock_rect(hue);

		await fireEvent.mouseDown(hue, { clientX: 30 });
		await fireEvent.mouseMove(window, { clientX: 60 });
		await fireEvent.mouseUp(window);

		expect(input).toHaveBeenCalled();
	});

	test("mouseup after dragging dispatches release with new value", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		const release = result.listen("release");

		await open_picker(result);

		const hue = result.getByRole("slider", { name: "Hue" });
		mock_rect(hue);

		await fireEvent.mouseDown(hue, { clientX: 40 });
		await fireEvent.mouseUp(window);

		expect(release).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledWith("#00ff66");
	});

	test("dragging updates get_data value", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});

		await open_picker(result);

		const hue = result.getByRole("slider", { name: "Hue" });
		mock_rect(hue);

		await fireEvent.mouseDown(hue, { clientX: 50 });
		await fireEvent.mouseUp(window);

		const data = await result.get_data();
		expect(data.value).toBe("#00ffff");
	});
});

describe("Color input field", () => {
	afterEach(() => cleanup());

	test("displays current color as hex by default", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		await open_picker(result);

		const input = result.getByRole("textbox") as HTMLInputElement;
		expect(input).toHaveValue("#ff0000");
	});

	test("entering a valid hex updates the value", async () => {
		const result = await render(ColorPicker, default_props);
		await open_picker(result);

		const input = result.getByRole("textbox");
		await fireEvent.change(input, { target: { value: "#ff0000" } });

		const data = await result.get_data();
		expect(data.value).toBe("#ff0000");
	});

	test("entering rgb() normalizes to hex", async () => {
		const result = await render(ColorPicker, default_props);
		await open_picker(result);

		const input = result.getByRole("textbox");
		await fireEvent.change(input, { target: { value: "rgb(255, 0, 0)" } });

		const data = await result.get_data();
		expect(data.value).toBe("#ff0000");
	});

	test("entering hsl() normalizes to hex", async () => {
		const result = await render(ColorPicker, default_props);
		await open_picker(result);

		const input = result.getByRole("textbox");
		await fireEvent.change(input, { target: { value: "hsl(0, 100%, 50%)" } });

		const data = await result.get_data();
		expect(data.value).toBe("#ff0000");
	});

	test("entering uppercase hex normalizes to lowercase", async () => {
		const result = await render(ColorPicker, default_props);
		await open_picker(result);

		const input = result.getByRole("textbox");
		await fireEvent.change(input, { target: { value: "#FF0000" } });

		const data = await result.get_data();
		expect(data.value).toBe("#ff0000");
	});

	test("entering 3-digit hex expands to 6-digit", async () => {
		const result = await render(ColorPicker, default_props);
		await open_picker(result);

		const input = result.getByRole("textbox");
		await fireEvent.change(input, { target: { value: "#f00" } });

		const data = await result.get_data();
		expect(data.value).toBe("#ff0000");
	});

	test("pressing Enter dispatches submit", async () => {
		const result = await render(ColorPicker, default_props);
		const submit = result.listen("submit");

		await open_picker(result);

		const input = result.getByRole("textbox");
		input.focus();
		await fireEvent.keyDown(input, { key: "Enter" });

		expect(submit).toHaveBeenCalledTimes(1);
	});
});

describe("Mode switching", () => {
	afterEach(() => cleanup());

	test("hex mode shows hex format", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		await open_picker(result);

		await fireEvent.click(result.getByRole("button", { name: "Hex" }));

		expect(result.getByRole("textbox")).toHaveValue("#ff0000");
	});

	test("rgb mode shows rgb() format", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		await open_picker(result);

		await fireEvent.click(result.getByRole("button", { name: "RGB" }));

		expect(result.getByRole("textbox")).toHaveValue("rgb(255, 0, 0)");
	});

	test("hsl mode shows hsl() format", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		await open_picker(result);

		await fireEvent.click(result.getByRole("button", { name: "HSL" }));

		expect(result.getByRole("textbox")).toHaveValue("hsl(0, 100%, 50%)");
	});

	test("switching mode preserves the color value", async () => {
		const result = await render(ColorPicker, {
			...default_props,
			value: "#ff0000"
		});
		await open_picker(result);

		await fireEvent.click(result.getByRole("button", { name: "RGB" }));
		await fireEvent.click(result.getByRole("button", { name: "HSL" }));
		await fireEvent.click(result.getByRole("button", { name: "Hex" }));

		const data = await result.get_data();
		expect(data.value).toBe("#ff0000");
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: emitted with new value when set_data pushes new value", async () => {
		const result = await render(ColorPicker, default_props);
		const change = result.listen("change");

		await result.set_data({ value: "#ff0000" });

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith("#ff0000");
	});

	test("change: not emitted on mount", async () => {
		const result = await render(ColorPicker, default_props);
		const change = result.listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("change: deduplicated when same value is set twice", async () => {
		const result = await render(ColorPicker, default_props);
		const change = result.listen("change");

		await result.set_data({ value: "#ff0000" });
		await result.set_data({ value: "#ff0000" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("focus: emitted when swatch is focused", async () => {
		const result = await render(ColorPicker, default_props);
		const focus = result.listen("focus");

		const swatch = result.getByRole("button", { name: "Color Picker" });
		swatch.focus();

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("blur: emitted when swatch loses focus", async () => {
		const result = await render(ColorPicker, default_props);
		const blur = result.listen("blur");

		const swatch = result.getByRole("button", { name: "Color Picker" });
		swatch.focus();
		await fireEvent.blur(swatch);

		expect(blur).toHaveBeenCalledTimes(1);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns current value", async () => {
		const { get_data } = await render(ColorPicker, {
			...default_props,
			value: "#0000ff"
		});
		const data = await get_data();
		expect(data.value).toBe("#0000ff");
	});

	test("set_data updates value and reflects in input field", async () => {
		const result = await render(ColorPicker, default_props);

		await result.set_data({ value: "#00ff00" });
		await open_picker(result);

		expect(result.getByRole("textbox")).toHaveValue("#00ff00");
	});

	test("set_data then get_data returns same value", async () => {
		const { set_data, get_data } = await render(ColorPicker, default_props);

		await set_data({ value: "#ff8800" });
		const data = await get_data();

		expect(data.value).toBe("#ff8800");
	});

	test("user input in text field is reflected in get_data", async () => {
		const result = await render(ColorPicker, default_props);
		await open_picker(result);

		const input = result.getByRole("textbox");
		await fireEvent.change(input, { target: { value: "#abcdef" } });

		const data = await result.get_data();
		expect(data.value).toBe("#abcdef");
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("multiple rapid set_data calls settle to final value", async () => {
		const { set_data, get_data } = await render(ColorPicker, default_props);

		await set_data({ value: "#ff0000" });
		await set_data({ value: "#00ff00" });
		await set_data({ value: "#0000ff" });

		const data = await get_data();
		expect(data.value).toBe("#0000ff");
	});
});
