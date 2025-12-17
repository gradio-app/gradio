import { test, describe, assert, afterEach, vi, beforeEach } from "vitest";
import { cleanup, render } from "@self/tootils";
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

	test("triggers preview_close event when pressing Escape key", async () => {
		const { listen, getByTestId } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: true,
			buttons: ["share", "download", "fullscreen"],
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
