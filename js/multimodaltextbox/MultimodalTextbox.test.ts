import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";

import MultimodalTextbox from "./Index.svelte";
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

describe("MultimodalTextbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 1,
			loading_status,
			lines: 1,
			value: { text: "hello world", files: [] },
			label: "Textbox",
			interactive: false,
			root: ""
		});

		const item: HTMLInputElement = getByDisplayValue(
			"hello world"
		) as HTMLInputElement;
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { component, getByDisplayValue, listen } = await render(
			MultimodalTextbox,
			{
				show_label: true,
				max_lines: 10,
				loading_status,
				lines: 1,
				value: { text: "hi ", files: [] },
				label: "MultimodalTextbox",
				interactive: true,
				root: ""
			}
		);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		const mock = listen("change");

		item.focus();
		await event.keyboard("some text");

		assert.equal(item.value, "hi some text");
		assert.equal(component.value.text, "hi some text");
		assert.equal(mock.callCount, 9);
		assert.equal(mock.calls[8][0].detail.data.text, "hi some text");
		assert.equal(mock.calls[8][0].detail.data.files.length, 0);
	});

	test("submitting should clear mic_audio", async () => {
		const { component } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 10,
			loading_status,
			lines: 1,
			value: { text: "", files: [] },
			label: "MultimodalTextbox",
			interactive: true,
			root: "",
			sources: ["microphone"]
		});

		component.$set({ mic_audio: { url: "test.mp3", mime_type: "audio/mp3" } });
		component.$set({ active_source: "microphone" });
		await component.$$.ctx[component.$$.props["handle_submit"]];
		assert.equal(component.mic_audio, null);
	});
});
