import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";

import Textbox from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Textbox, {
			show_label: true,
			max_lines: 1,
			loading_status,
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
		const { component, getByDisplayValue, listen } = await render(Textbox, {
			show_label: true,
			max_lines: 10,
			loading_status,
			lines: 1,
			value: "hi ",
			label: "Textbox",
			interactive: true
		});

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		const mock = listen("change");

		item.focus();
		await event.keyboard("some text");

		assert.equal(item.value, "hi some text");
		assert.equal(component.value, "hi some text");
		assert.equal(mock.callCount, 9);
		assert.equal(mock.calls[8][0].detail.data, "hi some text");
	});
});
