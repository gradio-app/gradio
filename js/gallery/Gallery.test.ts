import { test, describe, assert, afterEach, vi, beforeEach } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { setupi18n } from "../core/src/i18n";

import Gallery from "./Index.svelte";
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

describe("Gallery", () => {
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});
	beforeEach(() => {
		setupi18n();
	});
	test("renders the image provided", async () => {
		const { getByTestId } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: true,
			buttons: ["share", "download", "fullscreen"],
			selected_index: 0,
			value: [
				{
					image: {
						path: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg"
					},
					caption: null
				}
			]
		});
		let item = getByTestId("detailed-image") as HTMLImageElement;
		assert.equal(
			item.src,
			"https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg"
		);
	});

	test("renders the video provided", async () => {
		const { getByTestId } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: true,
			buttons: ["share", "download", "fullscreen"],
			selected_index: 0,
			value: [
				{
					video: {
						path: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/world.mp4",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/world.mp4"
					},
					caption: null
				}
			]
		});
		let item = getByTestId("detailed-video") as HTMLVideoElement;
		assert.equal(
			item.src,
			"https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/world.mp4"
		);
	});

	test.skip("triggers the change event if and only if the images change", async () => {
		// TODO: Fix this test, the test requires prop update using $set which is deprecated in Svelte 5.
		const { listen, component } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: true,
			value: [
				{
					image: {
						path: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg"
					},
					caption: null
				}
			]
		});
		const change_event = listen("change");

		await component.$set({
			value: [
				{
					image: {
						path: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg"
					},
					caption: null
				}
			]
		});
		assert.equal(change_event.callCount, 0);
	});

	test("deleting an individual gallery item dispatches delete and change events", async () => {
		const { listen, getAllByLabelText } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: false,
			interactive: true,
			buttons: ["share", "download", "fullscreen"],
			sources: ["upload"],
			value: [
				{
					image: {
						path: "https://example.com/a.jpg",
						url: "https://example.com/a.jpg"
					},
					caption: null
				},
				{
					image: {
						path: "https://example.com/b.jpg",
						url: "https://example.com/b.jpg"
					},
					caption: null
				}
			]
		});

		const delete_event = listen("delete");
		const change_event = listen("change");

		const delete_buttons = getAllByLabelText("Delete image");
		assert.equal(delete_buttons.length, 2);

		await fireEvent.click(delete_buttons[0]);

		assert.equal(
			delete_event.mock.calls.length,
			1,
			"delete event should fire once"
		);
		assert.equal(
			delete_event.mock.calls[0][0].index,
			0,
			"delete event should contain index of removed item"
		);
		assert.isTrue(
			change_event.mock.calls.length >= 1,
			"change event should fire after delete"
		);
	});

	test.skip("triggers preview_close event when pressing Escape key", async () => {
		const { listen, getByTestId } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: true,
			buttons: ["share", "download", "fullscreen"],
			selected_index: 0,
			value: [
				{
					image: {
						path: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/gallery_component/files/cheetah.jpg"
					},
					caption: null
				}
			]
		});

		const preview_close_event = listen("preview_close");

		// Find the preview container and dispatch Escape key event
		const preview = document.querySelector(".preview");
		if (preview) {
			const escapeEvent = new KeyboardEvent("keydown", {
				code: "Escape",
				key: "Escape",
				bubbles: true
			});
			preview.dispatchEvent(escapeEvent);
		}

		assert.isTrue(
			preview_close_event.callCount >= 1,
			"preview_close event should be triggered when pressing Escape"
		);
	});
});
