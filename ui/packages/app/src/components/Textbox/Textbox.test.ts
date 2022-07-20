import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render, get_text, wait } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Textbox from "./Textbox.svelte";
import type { LoadingStatus } from "../StatusTracker/types";

const loading_status = {
	eta: 0,
	queue_position: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0
};

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", () => {
		const { getByDisplayValue } = render(Textbox, {
			show_label: true,
			max_lines: 1,
			loading_status,
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
			show_label: true,
			max_lines: 10,
			loading_status,
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
