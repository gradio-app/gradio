import { test, describe, assert, afterEach, vi } from "vitest";
import { spy } from "tinyspy";
import { cleanup, render } from "@gradio/tootils";
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
		const { getByTestId, container, queryAllByText } = render(Audio, {
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

		assert.equal(
			getByTestId("Audio Component-dynamic-audio").src,
			"foo/file=https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
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

		const mock = spy();
		component.$on("change", mock);

		const item = container.querySelectorAll("input")[0];
		console.log(item);
		const file = new File(["hello"], "my-audio.wav", { type: "audio/wav" });
		event.upload(item, file);
		assert.equal(mock.callCount, 1);
	});

	// test("stop recording sets data", async () => {

	//     // const mediaDevicesMock = vi.fn()
	//     // mediaDevicesMock.mediaDevices = vi.fn();

	//     const mediaMock = vi.fn(() => ({
	//         mediaDevices: vi.fn(() => ({
	//             getUserMedia: vi.fn()
	//         }))(),
	//     }))
	//     vi.stubGlobal("navigator", mediaMock());
	//     vi.mock('extendable-media-recorder', async (importOriginal) => {
	//         const mod = await importOriginal();
	//         return {
	//             ...mod,
	//             // replace some exports
	//             MediaRecorder: vi.fn(),
	//         }
	//     });
	//     vi.mock('extendable-media-recorder-wav-encoder', async (importOriginal) => {
	//         const mod = await importOriginal();
	//         return {
	//             ...mod,
	//             // replace some exports
	//             connect: vi.fn(),
	//         }
	//     })

	//     const { component, getByText } = render(Audio, {
	//         show_label: true,
	//         loading_status,
	//         mode: "dynamic",
	//         value: null,
	//         label: "Audio Component",
	//         root: "foo",
	//         root_url: null,
	//         streaming: false,
	//         pending: false,
	//         source: "microphone"
	//     });

	//     const mock = spy();
	//     component.$on("stop_recording", mock);

	//     const startButton = getByText("Record from microphone");

	//     await event.click(startButton);
	//     const stopButton = getByText("Stop recording");
	//     await event.click(stopButton)

	//     assert.equal(mock.callCount, 1);
	//     //assert.equal(mock.calls[8][0].detail, "hi some text");
	// });
});
