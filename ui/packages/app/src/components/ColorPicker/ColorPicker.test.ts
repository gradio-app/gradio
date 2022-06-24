import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render, get_text, wait } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Textbox from "./Textbox.svelte";

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", () => {
		const { getByDisplayValue } = render(Textbox, {
			lines: 1,
			mode: "dynamic",
			value: "hello world",
			label: "Textbox"
		});

		const item: HTMLInputElement = getByDisplayValue("hello world");
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { component, getByLabelText, getByDisplayValue } = render(Textbox, {
			lines: 1,
			mode: "dynamic",
			value: "hi ",
			label: "Textbox"
		});

		const item: HTMLInputElement = getByDisplayValue("hi");

		const mock = spy();
		component.$on("change", mock);

		item.focus();
		event.keyboard("some text");

		// wait for debounce
		await wait(300);

		assert.equal(item.value, "hi some text");
		assert.equal(component.value, "hi some text");
		assert.equal(mock.callCount, 1);
		assert.equal(mock.calls[0][0].detail, "hi some text");
	});
});
