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

	test("renders provided value and label", async () => {
		const { getByTestId, queryAllByText } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "dynamic",
			value: [
				{
					name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
					data: null,
					is_file: true
				}
			],
			label: "Test Label",
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			name: "bar",
			source: "upload"
		});
		assert.isTrue(
			getByTestId("Test Label-player").src.endsWith(
				"foo/file=https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
			)
		);
		assert(queryAllByText("Test Label").length, 1);
	});

	test("hides label", async () => {
		const { queryAllByText } = await render(Video, {
			show_label: false,
			loading_status,
			mode: "dynamic",
			value: {
				name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
				data: null,
				is_file: true
			},
			label: "Video Component",
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			name: "bar",
			source: "upload"
		});
		assert(queryAllByText("Video Component").length, 0);
	});

	test("static Video sets value", async () => {
		const { getByTestId } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "static",
			value: [
				{
					name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
					data: null,
					is_file: true
				}
			],
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			name: "bar",
			source: "upload"
		});
		assert.isTrue(
			getByTestId("test-player").src.endsWith(
				"foo/file=https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
			)
		);
	});

	test("when autoplay is true `media.play` should be called in static mode", async () => {
		const { getByTestId } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "static",
			value: [
				{
					name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
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
		const startButton = getByTestId<HTMLAudioElement>("test-player");
		const fn = spyOn(startButton, "play");
		startButton.dispatchEvent(new Event("loadeddata"));
		assert.equal(fn.callCount, 1);
	});

	test("when autoplay is true `media.play` should be called in dynamic mode", async () => {
		const { getByTestId } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "dynamic",
			value: [
				{
					name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
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
		const startButton = getByTestId<HTMLAudioElement>("test-player");
		const fn = spyOn(startButton, "play");
		startButton.dispatchEvent(new Event("loadeddata"));
		assert.equal(fn.callCount, 1);
	});

	test("when autoplay is true `media.play` should be called in static mode when the Video data is updated", async () => {
		const { component, getByTestId } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "static",
			value: [
				{
					name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
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
		const startButton = getByTestId<HTMLAudioElement>("test-player");
		const fn = spyOn(startButton, "play");
		startButton.dispatchEvent(new Event("loadeddata"));
		component.$set({
			value: {
				name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
				data: null,
				is_file: true
			}
		});
		startButton.dispatchEvent(new Event("loadeddata"));
		assert.equal(fn.callCount, 2);
	});

	test("when autoplay is true `media.play` should be called in dynamic mode when the Video data is updated", async () => {
		const { component, getByTestId } = await render(Video, {
			show_label: true,
			loading_status,
			mode: "dynamic",
			value: [
				{
					name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
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
		const startButton = getByTestId<HTMLAudioElement>("test-player");
		const fn = spyOn(startButton, "play");
		startButton.dispatchEvent(new Event("loadeddata"));
		component.$set({
			value: {
				name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
				data: null,
				is_file: true
			}
		});
		startButton.dispatchEvent(new Event("loadeddata"));
		assert.equal(fn.callCount, 2);
	});
	test("renders video and download button", async () => {
		const data = [
			{
				data: null,
				name: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/video_component/files/a.mp4",
				is_file: true
			}
		];
		const results = await render(Video, {
			mode: "static",
			label: "video",
			show_label: true,
			value: data,
			root: "foo"
		});

		const downloadButton = results.getAllByTestId("download-div")[0];
		expect(
			downloadButton.getElementsByTagName("a")[0].getAttribute("href")
		).toBe(`foo/file=${data[0].name}`);
		expect(
			downloadButton.getElementsByTagName("button").length
		).toBeGreaterThan(0);
	});

	test("Video change event trigger fires when value is changed and only fires once", async () => {
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
