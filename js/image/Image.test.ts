import {
	test,
	describe,
	assert,
	afterEach,
	vi,
	beforeAll,
	beforeEach
} from "vitest";
import { spy } from "tinyspy";
import { cleanup, render } from "@gradio/tootils";
import { setupi18n } from "../app/src/i18n";

import Image from "./interactive";
import type { LoadingStatus } from "@gradio/statustracker";

const loading_status = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full" as LoadingStatus["show_progress"]
};

describe("Image", () => {
	beforeAll(() => {
		window.HTMLMediaElement.prototype.play = vi.fn();
		window.HTMLMediaElement.prototype.pause = vi.fn();
	});
	beforeEach(setupi18n);
	afterEach(() => cleanup());

	test("image change event trigger fires when value is changed and only fires once", async () => {
		const { component, listen } = await render(Image, {
			show_label: true,
			loading_status,
			value:
				"https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
			streaming: false,
			pending: false,
			source: "upload",
			label: "Test Label",
			width: 224,
			height: 224,
			mirror_webcam: false,
			shape: [224, 224],
			brush_color: "#000000",
			brush_radius: 5,
			mask_opacity: 0.5
		});

		const mock = listen("change");

		component.value =
			"https://github.com/gradio-app/gradio/blob/main/test/test_files/cheetah1.jpg";
		assert.equal(mock.callCount, 1);
	});
});
