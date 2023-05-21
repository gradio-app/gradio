import { test, describe, afterEach, vi, expect } from "vitest";
import { cleanup, render, fireEvent } from "@gradio/tootils";

import Range from "./Range.svelte";

describe("Range", () => {
	afterEach(() => cleanup());

	test("Release event called on blur and pointerUp", () => {
		const results = render(Range, {
			label: "range",
			show_label: true,
			value: 1,
			minimum: 0,
			maximum: 10
		});

		const numberInput = results.getAllByTestId("number-input")[0];
		const mock = vi.fn();
		results.component.$on("release", mock);

		fireEvent.pointerUp(numberInput);

		expect(mock).toHaveBeenCalledOnce();

		fireEvent.blur(numberInput);
		expect(mock).toHaveBeenCalledTimes(2);
	});
});
