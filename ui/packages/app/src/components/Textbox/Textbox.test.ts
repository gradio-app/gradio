import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render, get_text, wait } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Textbox from "./Textbox.svelte";

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", () => {
		const { container } = render(Textbox, {
			theme: "default",
			lines: 1,
			mode: "dynamic",
			value: "hello world"
		});

		const item: HTMLInputElement = container.querySelector(".input-text ")!;
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { container, component } = render(Textbox, {
			theme: "default",
			lines: 1,
			mode: "dynamic",
			value: ""
		});

		const item: HTMLInputElement = container.querySelector(".input-text ")!;

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
		const { container, component } = render(Textbox, {
			theme: "default",
			lines: 1,
			mode: "dynamic",
			value: "",
			placeholder: "placeholder text"
		});

		const item: HTMLInputElement = container.querySelector(".input-text ")!;
		assert.equal(item.placeholder, "placeholder text");
	});
});
