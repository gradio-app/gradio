import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@gradio/tootils";

import ColorPicker from "./ColorPicker.svelte";

describe("ColorPicker", () => {
	afterEach(() => cleanup());

	test("renders provided value", () => {
		const { getByDisplayValue } = render(ColorPicker, {
			value: "#000000",
			label: "ColorPicker"
		});

		const item: HTMLInputElement = getByDisplayValue("#000000");
		assert.equal(item.value, "#000000");
	});

	test("changing the color should update the value", async () => {
		const { component, getByDisplayValue } = render(ColorPicker, {
			value: "#000000",
			label: "ColorPicker"
		});

		const item: HTMLInputElement = getByDisplayValue("#000000");

		assert.equal(item.value, "#000000");

		await component.$set({
			value: "#FFFFFF"
		});

		assert.equal(component.value, "#FFFFFF");
	});
});
