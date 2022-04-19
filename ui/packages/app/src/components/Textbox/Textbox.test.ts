import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render, get_text, wait } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Textbox from "./Textbox.svelte";

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", () => {
		const { container, getByLabelText } = render(Textbox, {
			lines: 1,
			mode: "dynamic",
			value: "hello world",
			label: "Textbox"
		});

		const item: HTMLInputElement = getByLabelText("Textbox");
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { component, getByLabelText } = render(Textbox, {
			lines: 1,
			mode: "dynamic",
			value: "",
			label: "Textbox"
		});

		const item: HTMLInputElement = getByLabelText("Textbox");

		const mock = spy();
		component.$on("change", mock);

		item.focus();
		event.keyboard("some text");

		// wait for debounce
		await wait(300);

		assert.equal(item.value, "some text");
		assert.equal(component.value, "some text");
		assert.equal(mock.callCount, 1);
		assert.equal(mock.calls[0][0].detail, "some text");
	});

	test("component should respect placeholder", async () => {
		const { getByLabelText } = render(Textbox, {
			lines: 1,
			mode: "dynamic",
			value: "",
			placeholder: "placeholder text",
			label: "Textbox"
		});

		const item: HTMLInputElement = getByLabelText("Textbox");
		assert.equal(item.placeholder, "placeholder text");
	});
});
