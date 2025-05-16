import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import Audio from "./";
import type { LoadingStatus } from "@gradio/statustracker";
import { setupi18n } from "../core/src/i18n";
import ResizeObserver from "resize-observer-polyfill";

global.ResizeObserver = ResizeObserver;

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

const default_values = {
	loading_status,
	label: "music",
	value: {
		url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
		path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
		orig_name: "SoundHelix-Song-1.mp3"
	},
	show_label: true
};
describe("Audio", () => {
	setupi18n();

	afterEach(() => cleanup());

	test("renders audio component", async () => {
		const { getAllByTestId } = await render(Audio, {
			...default_values,
			interactive: true,
			sources: ["microphone", "upload"],
			pending: false,
			streaming: false
		});

		assert.exists(getAllByTestId("waveform-music"));
	});

	test("renders audio component with audio controls", async () => {
		const { getAllByTestId, getAllByLabelText, getAllByText } = await render(
			Audio,
			{
				...default_values,
				streaming: false,
				pending: false,
				sources: ["microphone"],
				interactive: true
			}
		);

		assert.exists(getAllByTestId("waveform-controls"));

		assert.exists(getAllByLabelText("Trim audio to selection"));
		assert.exists(getAllByLabelText("Reset audio"));
		assert.exists(getAllByText("0:00"));
		assert.exists(getAllByLabelText("audio.play"));
		assert.exists(getAllByLabelText("Adjust volume"));
		assert.exists(getAllByLabelText("Adjust playback speed to 1.5x"));
		assert.exists(getAllByLabelText("Skip forward by 5 seconds"));
	});

	test("does not render with audio editing controls when not interactive", async () => {
		const { getAllByTestId, queryByLabelText } = await render(Audio, {
			...default_values,
			streaming: false,
			pending: false,
			sources: ["microphone"],
			interactive: false
		});

		assert.exists(getAllByTestId("waveform-controls"));
		assert.notExists(queryByLabelText("Trim audio to selection"));
		assert.notExists(queryByLabelText("Reset audio"));
	});

	test("renders source selection with correct selected source", async () => {
		const { getByTestId, getByLabelText } = await render(Audio, {
			...default_values,
			streaming: false,
			pending: false,
			sources: ["microphone", "upload"],
			interactive: true
		});

		assert.exists(getByTestId("source-select"));
		assert.lengthOf(getByTestId("source-select").children, 2);
		assert.exists(getByLabelText("Record audio"));

		assert.equal(
			getByLabelText("Record audio").classList.contains("selected"),
			true
		);

		assert.equal(
			getByLabelText("Upload file").classList.contains("selected"),
			false
		);
	});

	test("does not render source selection when upload is only source", async () => {
		const { queryByTestId } = await render(Audio, {
			...default_values,
			streaming: false,
			pending: false,
			sources: ["upload"],
			interactive: true
		});

		assert.notExists(queryByTestId("source-select"));
	});
});
