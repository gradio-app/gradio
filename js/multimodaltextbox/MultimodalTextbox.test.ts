import { test, describe, assert, afterEach, expect, vi } from "vitest";
import { cleanup, render, mock_client } from "@self/tootils/render";
import event from "@testing-library/user-event";
import { tick } from "svelte";

import MultimodalTextbox from "./Index.svelte";
import type { ILoadingStatus as LoadingStatus } from "@gradio/statustracker";

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
			root: "",
			sources: []
		});

		const item: HTMLInputElement = getByDisplayValue(
			"hello world"
		) as HTMLInputElement;
		assert.equal(item.value, "hello world");
	});

	test.skip("changing the text should update the value", async () => {
		const { getByDisplayValue, listen } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 10,
			loading_status,
			lines: 1,
			value: { text: "hi ", files: [] },
			label: "MultimodalTextbox",
			interactive: true,
			root: "",
			sources: []
		});

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		const mock = listen("change");

		item.focus();
		await event.keyboard("some text");

		assert.equal(item.value, "hi some text");
		assert.equal(mock.callCount, 9);
		assert.equal(mock.calls[8][0].detail.data.text, "hi some text");
		assert.equal(mock.calls[8][0].detail.data.files.length, 0);
	});

	test.skip("submitting should clear mic_audio", async () => {
		const { getByTestId, listen } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 10,
			loading_status,
			lines: 1,
			value: { text: "", files: [] },
			label: "MultimodalTextbox",
			interactive: true,
			root: "",
			sources: ["microphone"],
			submit_btn: true
		});

		const mock = listen("submit");
		const submitButton = getByTestId("submit-button");
		await event.click(submitButton);
		assert.equal(mock.callCount, 1);
	});

	function paste_event(
		text: string | null,
		image_name?: string,
		with_html = true
	): ClipboardEvent {
		const data = new DataTransfer();
		if (text) {
			data.setData("text/plain", text);
			if (with_html) {
				data.setData("text/html", `<table><tr><td>${text}</td></tr></table>`);
			}
		}
		if (image_name) {
			data.items.add(
				new File([new Uint8Array([1, 2, 3])], image_name, {
					type: "image/png"
				})
			);
		}
		return new ClipboardEvent("paste", {
			clipboardData: data,
			bubbles: true,
			cancelable: true
		});
	}

	test("a paste is handled as text or as an image, never both", async () => {
		const { getByTestId, listen } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 1,
			loading_status,
			lines: 1,
			value: { text: "", files: [] },
			label: "MultimodalTextbox",
			interactive: true,
			root: "http://localhost:7860",
			sources: ["upload"],
			client: mock_client()
		});

		const upload = listen("upload");
		const textbox = getByTestId("textbox");

		const excel_paste = paste_event("1\t2\n3\t4", "cells.png");
		textbox.dispatchEvent(excel_paste);
		// an image alone is still attached. Waiting for that upload also bounds
		// the assertion that the paste above uploaded nothing.
		const image_paste = paste_event(null, "screenshot.png");
		textbox.dispatchEvent(image_paste);

		const uploaded = (): string[] =>
			upload.mock.calls.flat(2).map((file) => file.orig_name);

		// wait for the screenshot itself, so a regression that uploads
		// cells.png first cannot satisfy the wait and slip past
		await vi.waitFor(() => expect(uploaded()).toContain("screenshot.png"));
		await tick();

		assert.deepEqual(uploaded(), ["screenshot.png"]);
		assert.isFalse(excel_paste.defaultPrevented);
		assert.isTrue(image_paste.defaultPrevented);
	});

	test("with nowhere to upload, only a text paste falls back to the browser", async () => {
		const { getByTestId, listen } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 1,
			loading_status,
			lines: 1,
			// file_count "single" with a file already attached unmounts Upload
			file_count: "single",
			value: {
				text: "",
				files: [
					{
						path: "cats.jpg",
						orig_name: "cats.jpg",
						mime_type: "image/jpeg",
						meta: { _type: "gradio.FileData" }
					}
				]
			},
			label: "MultimodalTextbox",
			interactive: true,
			root: "http://localhost:7860",
			max_plain_text_length: 1000,
			sources: ["upload"],
			client: mock_client()
		});

		const upload = listen("upload");
		const textbox = getByTestId("textbox");

		const image_paste = paste_event(null, "screenshot.png");
		textbox.dispatchEvent(image_paste);
		const long_paste = paste_event("x".repeat(2000));
		textbox.dispatchEvent(long_paste);
		const path_paste = paste_event("file:///cats.jpg", "cats.jpg", false);
		textbox.dispatchEvent(path_paste);

		await tick();
		await tick();

		expect(upload).not.toHaveBeenCalled();
		// the browser would paste the image's file name, which is worth nothing
		assert.isTrue(image_paste.defaultPrevented);
		// text is its own fallback, so it must not be swallowed either way
		assert.isFalse(long_paste.defaultPrevented);
		assert.isFalse(path_paste.defaultPrevented);
	});

	test("text with no HTML flavor leaves the image alone", async () => {
		const { getByTestId, listen } = await render(MultimodalTextbox, {
			show_label: true,
			max_lines: 1,
			loading_status,
			lines: 1,
			value: { text: "", files: [] },
			label: "MultimodalTextbox",
			interactive: true,
			root: "http://localhost:7860",
			sources: ["upload"],
			client: mock_client()
		});

		const upload = listen("upload");
		// a file manager copying an image can put its path in text/plain with
		// no text/html, and there the image is the point of the paste
		getByTestId("textbox").dispatchEvent(
			paste_event("file:///cats.jpg", "cats.jpg", false)
		);

		await vi.waitFor(() => expect(upload).toHaveBeenCalled());

		assert.deepEqual(
			upload.mock.calls.flat(2).map((file) => file.orig_name),
			["cats.jpg"]
		);
	});
});
