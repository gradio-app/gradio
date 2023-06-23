import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render, wait_for_event } from "@gradio/tootils";
import event from "@testing-library/user-event";
import { setupi18n } from "../../i18n";

import Audio from "./Audio.svelte";
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

describe("Audio", () => {
	afterEach(() => cleanup());

	test("renders provided value and label", async () => {
		const { getByTestId, queryAllByText } = render(Audio, {
			show_label: true,
			loading_status,
			mode: "dynamic",
			value: {
				name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
				data: null,
				is_file: true
			},
			label: "Audio Component",
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			name: "bar",
			source: "upload"
		});

		assert.isTrue(
			getByTestId("Audio Component-dynamic-audio").src.endsWith(
				"foo/file=https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
			)
		);
		assert(queryAllByText("Audio Component").length, 1);
	});

	test("hides label", async () => {
		const { queryAllByText } = render(Audio, {
			show_label: false,
			loading_status,
			mode: "dynamic",
			value: {
				name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
				data: null,
				is_file: true
			},
			label: "Audio Component",
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			name: "bar",
			source: "upload"
		});

		assert(queryAllByText("Audio Component").length, 0);
	});

	test("upload sets change event", async () => {
		setupi18n();
		const { container, component } = render(Audio, {
			show_label: false,
			loading_status,
			value: null,
			mode: "dynamic",
			label: "audio",
			root: "foo",
			root_url: null,
			streaming: false,
			name: "bar",
			source: "upload"
		});

		const item = container.querySelectorAll("input")[0];
		const file = new File(["hello"], "my-audio.wav", { type: "audio/wav" });
		event.upload(item, file);
		const mock = await wait_for_event(component, "change");
		assert.equal(mock.callCount, 1);
		assert.equal(
			component.$capture_state().value.data,
			"data:audio/wav;base64,aGVsbG8="
		);
		assert.equal(component.$capture_state().value.name, "my-audio.wav");
	});

	test("static audio sets value", async () => {
		const { getByTestId } = render(Audio, {
			show_label: true,
			loading_status,
			mode: "static",
			value: {
				name: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
				data: null,
				is_file: true
			},
			label: "Audio Component",
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			name: "bar",
			source: "upload"
		});

		assert.isTrue(
			getByTestId("Audio Component-static-audio").src.endsWith(
				"foo/file=https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
			)
		);
	});

	test("stop recording sets data", async () => {
		let data_event;
		let stop_event;

		const media_recorder_mock = vi.fn((s, x) => {
			return {
				start: vi.fn(() => {
					data_event({ data: "hello" });
					data_event({ data: "hello" });
					data_event({ data: "hello" });
					data_event({ data: "hello" });
				}),
				stop: vi.fn(async () => {
					await stop_event();
				}),
				addEventListener: vi.fn((evt, cb) => {
					if (evt === "dataavailable") {
						data_event = cb;
					}

					if (evt === "stop") {
						stop_event = cb;
					}
				})
			};
		});

		const media_mock = {
			mediaDevices: {
				getUserMedia: vi.fn(() => Promise.resolve(true))
			}
		};

		vi.stubGlobal("navigator", media_mock);
		vi.stubGlobal("MediaRecorder", media_recorder_mock);

		const { component, getByText } = render(Audio, {
			show_label: true,
			loading_status,
			mode: "dynamic",
			value: null,
			label: "Audio Component",
			root: "foo",
			root_url: null,
			streaming: false,
			pending: false,
			source: "microphone"
		});

		const startButton = getByText("Record from microphone");
		await event.click(startButton);
		const stopButton = getByText("Stop recording");
		await event.click(stopButton);
		const mock = await wait_for_event(component, "stop_recording");

		assert.equal(
			component.$capture_state().value.data,
			"data:audio/wav;base64,aGVsbG9oZWxsb2hlbGxvaGVsbG8="
		);
		assert.equal(component.$capture_state().value.name, "audio.wav");
		assert.equal(mock.callCount, 1);
	});
});
