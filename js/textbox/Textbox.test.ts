import { test, describe, assert, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";

import Textbox from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";
import { tick } from "svelte";

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Textbox, {
			show_label: true,
			max_lines: 1,
			lines: 1,
			value: "hello world",
			label: "Textbox",
			interactive: false
		});

		const item: HTMLInputElement = getByDisplayValue(
			"hello world"
		) as HTMLInputElement;
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, {
			show_label: true,
			max_lines: 10,
			lines: 1,
			value: "hi ",
			label: "Textbox",
			interactive: true
		});

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		item.focus();
		await event.keyboard("some text");

		expect(item.value).toBe("hi some text");
	});
});

describe("Events", () => {
	test("emits an input event when the value changes", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, {
			show_label: true,
			max_lines: 10,
			lines: 1,
			value: "hi ",
			label: "Textbox",
			interactive: true
		});

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		item.focus();

		const input_event = listen("input");

		await event.keyboard("some text");
		expect(input_event).toHaveBeenCalled();
		expect(input_event).toHaveBeenCalledTimes(9);
	});

	test("emits a change event when the value changes from outside", async () => {
		const { listen, set_data } = await render(Textbox, {
			show_label: true,
			max_lines: 10,
			lines: 1,
			value: "hi ",
			label: "Textbox",
			interactive: true
		});

		const change_event = listen("change");

		set_data({ value: "hello world" });
		// dispatch_change() in Textbox awaits tick() internally
		await tick();
		await tick();

		expect(change_event).toHaveBeenCalled();
		expect(change_event).toHaveBeenCalledTimes(1);
	});
});
