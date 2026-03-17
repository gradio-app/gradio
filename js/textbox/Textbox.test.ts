import { test, describe, assert, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import event from "@testing-library/user-event";

import Textbox from "./Index.svelte";
import { tick } from "svelte";

const default_props = {
	show_label: true,
	max_lines: 10,
	lines: 1,
	value: "hi ",
	label: "Textbox",
	interactive: true
};

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Textbox, {
			...default_props,
			max_lines: 1,
			value: "hello world",
			interactive: false
		});

		const item: HTMLInputElement = getByDisplayValue(
			"hello world"
		) as HTMLInputElement;
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { getByDisplayValue } = await render(Textbox, default_props);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		item.focus();
		await event.keyboard("some text");

		expect(item.value).toBe("hi some text");
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: emitted when value changes from outside", async () => {
		const { listen, set_data } = await render(Textbox, default_props);

		const change = listen("change");

		await set_data({ value: "hello world" });

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith("hello world");
	});

	test("input: emitted on each keystroke", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, default_props);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;
		const input = listen("input");

		item.focus();
		await event.keyboard("ab");

		expect(input).toHaveBeenCalled();
		expect(input).toHaveBeenCalledTimes(1);
	});

	test("submit: emitted on Enter key in single-line textbox", async () => {
		const { getByDisplayValue, listen, get_data } = await render(
			Textbox,
			default_props
		);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;
		const submit = listen("submit");

		item.focus();
		await event.keyboard("ab");
		await event.keyboard("{Enter}");

		expect(submit).toHaveBeenCalledTimes(1);
		const new_data = await get_data();
		expect(new_data.value).toEqual("hi ab");
	});

	test("submit: emitted when submit button is clicked", async () => {
		const { listen, getByTestId } = await render(Textbox, {
			...default_props,
			submit_btn: true
		});

		const submit = listen("submit");
		const btn = getByTestId("submit-button") as HTMLButtonElement;

		fireEvent.click(btn);

		expect(submit).toHaveBeenCalledTimes(1);
	});

	test("blur: emitted when input loses focus", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, default_props);

		const item = getByDisplayValue("hi");
		const blur = listen("blur");

		item.focus();
		item.blur();

		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("focus: emitted when input gains focus", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, default_props);

		const item = getByDisplayValue("hi");
		const focus = listen("focus");

		item.focus();

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("select: emitted when text is selected", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, {
			...default_props,
			value: "hello world"
		});

		const item = getByDisplayValue("hello world") as HTMLInputElement;
		const select = listen("select");

		item.focus();
		item.setSelectionRange(0, 5);
		await fireEvent.select(item);

		expect(select).toHaveBeenCalledWith({
			value: "hello",
			index: [0, 5]
		});
	});

	test("stop: emitted when stop button is clicked", async () => {
		const { listen, getByTestId } = await render(Textbox, {
			...default_props,
			stop_btn: true
		});

		const stop = listen("stop");
		const btn = getByTestId("stop-button");

		await fireEvent.click(btn);

		expect(stop).toHaveBeenCalledTimes(1);
	});

	test("copy: emitted when copy button is clicked", async () => {
		const { listen, getByLabelText } = await render(Textbox, {
			...default_props,
			value: "copy me",
			buttons: ["copy"]
		});

		const copy = listen("copy");
		const btn = getByLabelText("Copy");

		btn.focus();

		await fireEvent.click(btn);
		// await tick();

		expect(copy).toHaveBeenCalledTimes(1);
		expect(copy).toHaveBeenCalledWith({ value: "copy me" });
	});

	test("custom_button_click: emitted when custom button is clicked", async () => {
		const { listen, getByLabelText } = await render(Textbox, {
			...default_props,
			buttons: [{ value: "Run", id: 42, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Run");
		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 42 });
	});
});

function pause(n) {
	return new Promise((resolve) => setTimeout(resolve, n));
}
