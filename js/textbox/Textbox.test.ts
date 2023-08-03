import { test, describe, assert, afterEach } from "vitest";
import { spy } from "tinyspy";
import { cleanup, fireEvent, render, get_text, wait } from "@gradio/tootils";
import event from "@testing-library/user-event";

import Textbox from "./index.svelte";
import type { LoadingStatus } from "@gradio/statustracker/types";

const loading_status = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0
};

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Textbox, {
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
		const { component, getByDisplayValue } = await render(Textbox, {
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
		await event.keyboard("some text");

		assert.equal(item.value, "hi some text");
		assert.equal(component.value, "hi some text");
		assert.equal(mock.callCount, 9);
		assert.equal(mock.calls[8][0].detail, "hi some text");
	});
});
