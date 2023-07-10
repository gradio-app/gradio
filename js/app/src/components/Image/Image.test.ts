import {
	test,
	describe,
	assert,
	afterEach,
	vi,
	beforeAll,
	beforeEach,
	expect
} from "vitest";
import { spy, spyOn } from "tinyspy";
import { cleanup, render } from "@gradio/tootils";
import { setupi18n } from "../../i18n";

import Video from "./Video.svelte";
import type { LoadingStatus } from "../StatusTracker/types";

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

describe("Video", () => {
	beforeAll(() => {
		window.HTMLMediaElement.prototype.play = vi.fn();
		window.HTMLMediaElement.prototype.pause = vi.fn();
	});
	beforeEach(setupi18n);
	afterEach(() => cleanup());

	test("video change event trigger fires when value is changed and only fires once", async () => {
		const { component } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "dynamic",
			value: [
				{
					name: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/video_component/files/a.mp4",
					data: null,
					is_file: true
				}
			],
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			source: "upload",
			autoplay: true
		});

		const mock = spy();
		component.$on("change", mock);

		(component.value = [
			{
				name: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/video_component/files/b.mp4",
				data: null,
				is_file: true
			}
		]),
			assert.equal(mock.callCount, 1);
	});
});
