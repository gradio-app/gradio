import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";
import { setupi18n } from "../app/src/i18n";

import Gallery from "./static";
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
			root: "",
			root_url: "",
			value: [
				"https://gradio-static-files.s3.us-west-2.amazonaws.com/header-image.jpg"
			]
		});
		let item = getByTestId("detailed-image") as HTMLImageElement;
		assert.equal(
			item.src,
			"https://gradio-static-files.s3.us-west-2.amazonaws.com/header-image.jpg"
		);
	});

	test("triggers the change event if and only if the images change", async () => {
		const { listen, component } = await render(Gallery, {
			show_label: true,
			label: "Gallery",
			loading_status: loading_status,
			preview: true,
			root: "",
			root_url: "",
			value: [
				"https://gradio-static-files.s3.us-west-2.amazonaws.com/header-image.jpg"
			]
		});
		const change_event = listen("change");

		await component.$set({
			value: [
				"https://gradio-static-files.s3.us-west-2.amazonaws.com/header-image.jpg"
			]
		});
		assert.equal(change_event.callCount, 0);

		await component.$set({
			value: ["https://gradio-static-files.s3.us-west-2.amazonaws.com/lion.jpg"]
		});
		assert.equal(change_event.callCount, 1);
	});
});
