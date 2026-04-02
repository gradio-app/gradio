import { test, describe, expect, afterEach, vi } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Gallery from "./Index.svelte";

const fake_image = (id: string) => ({
	path: `${id}.png`,
	url: `https://example.com/${id}.png`,
	orig_name: `${id}.png`,
	size: 1024,
	mime_type: "image/png",
	is_stream: false
});

const fake_video = (id: string) => ({
	path: `${id}.mp4`,
	url: `https://example.com/${id}.mp4`,
	orig_name: `${id}.mp4`,
	size: 2048,
	mime_type: "video/mp4",
	is_stream: false
});

const default_props = {
	label: "Gallery",
	show_label: true,
	preview: true,
	allow_preview: true,
	selected_index: null as number | null,
	object_fit: "cover" as const,
	buttons: ["fullscreen"] as string[],
	value: null as any,
	columns: 2,
	rows: undefined as number | undefined,
	height: "auto",
	fit_columns: true,
	interactive: false,
	sources: ["upload"] as ("upload" | "webcam" | "clipboard")[]
};

describe("Gallery", () => {
	afterEach(() => cleanup());

	test("renders the image provided in preview", async () => {
		const { getByTestId } = await render(Gallery, {
			...default_props,
			preview: true,
			selected_index: 0,
			buttons: ["share", "download", "fullscreen"],
			value: [{ image: fake_image("cat"), caption: null }]
		});

		const item = getByTestId("detailed-image") as HTMLImageElement;
		expect(item.src).toBe("https://example.com/cat.png");
	});

	test("renders the video provided in preview", async () => {
		const { getByTestId } = await render(Gallery, {
			...default_props,
			preview: true,
			selected_index: 0,
			buttons: ["share", "download", "fullscreen"],
			value: [{ video: fake_video("clip"), caption: null }]
		});

		const item = getByTestId("detailed-video") as HTMLVideoElement;
		expect(item.src).toBe("https://example.com/clip.mp4");
	});
});

// Regression test for https://github.com/gradio-app/gradio/issues/13170
// When appending a new image and setting selected_index to the last item,
// the gallery would select the second-to-last image because the index was
// clamped against the stale resolved_value.length instead of value.length.
describe("Regression: #13170 — selected_index points to newly appended image", () => {
	afterEach(() => cleanup());

	test("selected_index pointing to a newly appended last item shows the correct image", async () => {
		const initial_value = [
			{ image: fake_image("img1"), caption: null },
			{ image: fake_image("img2"), caption: null }
		];

		const { set_data, getByTestId } = await render(Gallery, {
			...default_props,
			preview: true,
			selected_index: 0,
			value: initial_value
		});

		// Append a new image and set selected_index to the new last item
		const updated_value = [
			...initial_value,
			{ image: fake_image("img3"), caption: null }
		];

		await set_data({ value: updated_value, selected_index: 2 });

		// The preview should show the newly appended image (img3),
		// NOT the second-to-last image (img2)
		const preview_img = getByTestId("detailed-image") as HTMLImageElement;
		expect(preview_img.src).toBe("https://example.com/img3.png");
	});

	test("selected_index pointing to newly appended item dispatches select with correct data", async () => {
		const initial_value = [
			{ image: fake_image("a"), caption: null },
			{ image: fake_image("b"), caption: null }
		];

		const { set_data, listen } = await render(Gallery, {
			...default_props,
			preview: true,
			selected_index: 0,
			value: initial_value
		});

		const select = listen("select");

		const new_image = { image: fake_image("c"), caption: null };
		await set_data({
			value: [...initial_value, new_image],
			selected_index: 2
		});

		// The select event should fire with index 2 pointing to the new image
		expect(select).toHaveBeenCalled();
		const last_call = select.mock.calls[select.mock.calls.length - 1][0];
		expect(last_call.index).toBe(2);
	});

	test("rapidly appending images with selected_index tracking last always shows the latest", async () => {
		const { set_data, getByTestId } = await render(Gallery, {
			...default_props,
			preview: true,
			selected_index: 0,
			value: [{ image: fake_image("img1"), caption: null }]
		});

		// Simulate multiple rapid appends (like a streaming chatbot adding images)
		for (let i = 2; i <= 5; i++) {
			const images = Array.from({ length: i }, (_, j) => ({
				image: fake_image(`img${j + 1}`),
				caption: null
			}));
			await set_data({ value: images, selected_index: i - 1 });
		}

		// After all appends, preview should show the very last image
		const preview_img = getByTestId("detailed-image") as HTMLImageElement;
		expect(preview_img.src).toBe("https://example.com/img5.png");
	});
});
