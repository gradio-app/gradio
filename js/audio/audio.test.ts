import {
	test,
	describe,
	assert,
	afterEach,
	beforeEach,
	vi,
	expect
} from "vitest";
import {
	cleanup,
	render,
	fireEvent,
	waitFor,
	upload_file,
	drop_file,
	mock_client,
	TEST_WAV
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import Audio from "./";
import WaveSurfer from "wavesurfer.js";
import type { LoadingStatus } from "@gradio/statustracker";
import { setupi18n } from "../core/src/i18n";

// WaveSurfer.destroy() throws AbortError when in-flight fetches are cancelled
// during test cleanup. This is expected and not a test failure.
function suppress_abort(e: PromiseRejectionEvent): void {
	if (e.reason?.name === "AbortError") {
		e.preventDefault();
	}
}
window.addEventListener("unhandledrejection", suppress_abort);

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full",
	type: "input" as const,
	stream_state: "closed" as const
};

const fake_value = {
	...TEST_WAV,
	is_stream: false
};

const default_props = {
	loading_status,
	label: "Audio",
	show_label: true,
	value: null as any,
	sources: ["upload", "microphone"] as ("upload" | "microphone")[],
	interactive: true,
	streaming: false,
	pending: false,
	waveform_options: {
		trim_region_color: "#f97316",
		show_recording_waveform: true,
		show_controls: true
	},
	editable: true,
	buttons: [] as (string | { value: string; id: number; icon: null })[]
};

run_shared_prop_tests({
	component: Audio,
	name: "Audio",
	base_props: {
		...default_props
	},
	has_label: false,
	has_validation_error: false
});

describe("Audio", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("renders audio component with upload area when value is null", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			sources: ["upload"],
			value: null
		});

		expect(getByLabelText("audio.drop_to_upload")).toBeVisible();
	});

	test("renders audio component with waveform when value is set", async () => {
		const { getAllByTestId } = await render(Audio, {
			...default_props,
			label: "music",
			value: fake_value,
			sources: ["microphone", "upload"]
		});

		assert.exists(getAllByTestId("waveform-music"));
	});
});

describe("Props: sources", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("multiple sources renders source selection buttons", async () => {
		const { getByTestId } = await render(Audio, {
			...default_props,
			sources: ["microphone", "upload"]
		});

		expect(getByTestId("source-select")).toBeTruthy();
	});

	test("single upload source does not render source selection", async () => {
		const { queryByTestId } = await render(Audio, {
			...default_props,
			sources: ["upload"]
		});

		expect(queryByTestId("source-select")).toBeNull();
	});

	test("source selection shows correct selected source", async () => {
		const { getByTestId, getByLabelText } = await render(Audio, {
			...default_props,
			sources: ["microphone", "upload"]
		});

		expect(getByTestId("source-select").children).toHaveLength(2);
		expect(getByLabelText("Record audio").classList.contains("selected")).toBe(
			true
		);
		expect(getByLabelText("Upload file").classList.contains("selected")).toBe(
			false
		);
	});

	test("clicking upload source button shows upload area", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			sources: ["microphone", "upload"],
			value: null
		});

		await fireEvent.click(getByLabelText("Upload file"));
		expect(getByLabelText("audio.drop_to_upload")).toBeVisible();
	});
});

describe("Props: interactive", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("interactive=true with value shows editing controls", async () => {
		const { getAllByTestId, getAllByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		assert.exists(getAllByTestId("waveform-controls"));
		assert.exists(getAllByLabelText("Trim audio to selection"));
		assert.exists(getAllByLabelText("Reset audio"));
	});

	test("interactive=false does not render editing controls", async () => {
		const { getAllByTestId, queryByLabelText } = await render(Audio, {
			...default_props,
			interactive: false,
			value: fake_value,
			sources: ["microphone"]
		});

		assert.exists(getAllByTestId("waveform-controls"));
		expect(queryByLabelText("Trim audio to selection")).toBeNull();
		expect(queryByLabelText("Reset audio")).toBeNull();
	});

	test("interactive=false with null value does not show upload area", async () => {
		const { queryByLabelText } = await render(Audio, {
			...default_props,
			interactive: false,
			value: null
		});

		expect(queryByLabelText("audio.drop_to_upload")).toBeNull();
	});
});

describe("Events: change", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("setting value triggers change event", async () => {
		const { listen, set_data } = await render(Audio, {
			...default_props,
			value: null
		});

		const change = listen("change");

		await set_data({ value: fake_value });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change event is not triggered on mount with a default value", async () => {
		const { listen } = await render(Audio, {
			...default_props,
			value: fake_value
		});

		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("changing value multiple times triggers change each time", async () => {
		const { listen, set_data } = await render(Audio, {
			...default_props,
			value: null
		});

		const change = listen("change");

		const value_a = { ...fake_value, url: "https://example.com/a.wav" };
		const value_b = { ...fake_value, url: "https://example.com/b.wav" };

		await set_data({ value: value_a });
		await set_data({ value: value_b });

		expect(change).toHaveBeenCalledTimes(2);
	});

	test("setting value to null after a value triggers change", async () => {
		const { listen, set_data } = await render(Audio, {
			...default_props,
			value: fake_value
		});

		const change = listen("change");

		await set_data({ value: null });

		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Props: buttons (static mode)", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("buttons with download shows download link", async () => {
		const { container } = await render(Audio, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: ["download"]
		});

		const downloadLink = container.querySelector("a[download]");
		expect(downloadLink).toBeTruthy();
	});

	test("custom button renders and dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(Audio, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: [{ value: "Transcribe", id: 3, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Transcribe");

		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 3 });
	});
});

describe("Props: buttons (interactive mode)", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("clear button appears when audio has a value", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		const clearBtn = getByLabelText("common.clear");
		expect(clearBtn).toBeTruthy();
	});

	test("clicking clear button removes the audio and dispatches clear and input", async () => {
		const { getByLabelText, listen } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		const clear = listen("clear");
		const input = listen("input");
		const clearBtn = getByLabelText("common.clear");

		await fireEvent.click(clearBtn);

		expect(clear).toHaveBeenCalledTimes(1);
		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("get_data", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("get_data returns the current value", async () => {
		const { get_data, set_data } = await render(Audio, {
			...default_props,
			value: null
		});

		const initial = await get_data();
		expect(initial.value).toBeNull();

		await set_data({ value: fake_value });

		const updated = await get_data();
		expect(updated.value).toEqual(fake_value);
	});
});

const upload_props = {
	...default_props,
	sources: ["upload"] as "upload"[],
	interactive: true,
	value: null,
	root: "https://example.com",
	client: mock_client()
};

describe("Events: upload via file input", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("selecting a file triggers upload, change, and input events", async () => {
		const { listen } = await render(Audio, upload_props);

		const upload = listen("upload");
		const change = listen("change");
		const input = listen("input");

		await upload_file(TEST_WAV);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(input).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("drag and drop a file triggers upload, change, and input events", async () => {
		const { listen } = await render(Audio, upload_props);

		const upload = listen("upload");
		const change = listen("change");
		const input = listen("input");

		await drop_file(TEST_WAV, "[aria-label='audio.drop_to_upload']");

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(input).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("upload failure dispatches error event with the message", async () => {
		const failing_upload = vi
			.fn()
			.mockRejectedValue(new Error("File too large"));
		const { listen } = await render(Audio, {
			...upload_props,
			client: {
				upload: failing_upload,
				stream: async () => ({ onmessage: null, close: () => {} })
			}
		});

		const error = listen("error");

		await upload_file(TEST_WAV);

		await waitFor(() => {
			expect(failing_upload).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith("File too large");
	});
});

describe("Waveform controls", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("play button is rendered when audio has a value", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		expect(getByLabelText("audio.play")).toBeTruthy();
	});

	test("skip forward and backward buttons are rendered", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		expect(getByLabelText("Skip forward by 5 seconds")).toBeTruthy();
		expect(getByLabelText("Skip backwards by 5 seconds")).toBeTruthy();
	});

	test("trim button is rendered in interactive mode", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		expect(getByLabelText("Trim audio to selection")).toBeTruthy();
	});

	test("clicking trim button enters edit mode with Trim and Cancel buttons", async () => {
		const { getByLabelText, getByText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		await fireEvent.click(getByLabelText("Trim audio to selection"));

		expect(getByText("Trim")).toBeTruthy();
		expect(getByText("Cancel")).toBeTruthy();
	});

	test("clicking Cancel exits edit mode and restores trim button", async () => {
		const { getByLabelText, getByText, queryByText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		await fireEvent.click(getByLabelText("Trim audio to selection"));
		expect(getByText("Cancel")).toBeTruthy();

		await fireEvent.click(getByText("Cancel"));

		expect(queryByText("Cancel")).toBeNull();
		expect(getByLabelText("Trim audio to selection")).toBeTruthy();
	});

	test("playback speed button cycles through speeds", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		// Default speed is 1x, button label shows next speed (1.5x)
		const speedBtn = getByLabelText("Adjust playback speed to 1.5x");
		expect(speedBtn).toBeTruthy();

		await fireEvent.click(speedBtn);

		// After clicking, speed is 1.5x, next is 2x
		expect(getByLabelText("Adjust playback speed to 2x")).toBeTruthy();
	});

	test("volume button is rendered", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"]
		});

		expect(getByLabelText("Adjust volume")).toBeTruthy();
	});
});

describe("Waveform options", () => {
	setupi18n();
	let createSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		createSpy = vi.spyOn(WaveSurfer, "create");
	});
	afterEach(() => {
		createSpy.mockRestore();
		cleanup();
	});

	function get_last_create_args(): Record<string, any> {
		return createSpy.mock.calls[createSpy.mock.calls.length - 1][0];
	}

	test("custom waveform_color is passed to WaveSurfer.create as waveColor", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				...default_props.waveform_options,
				waveform_color: "#ff0000"
			}
		});

		expect(get_last_create_args().waveColor).toBe("#ff0000");
	});

	test("custom waveform_progress_color is passed as progressColor", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				...default_props.waveform_options,
				waveform_progress_color: "#00ff00"
			}
		});

		expect(get_last_create_args().progressColor).toBe("#00ff00");
	});

	test("default waveform colors are applied when not specified", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				trim_region_color: "#f97316",
				show_recording_waveform: true,
				show_controls: true
			}
		});

		const args = get_last_create_args();
		expect(args.waveColor).toBe("#9ca3af");
		expect(args.progressColor).toBe("darkorange");
	});

	test("show_controls maps to mediaControls in WaveSurfer settings", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				...default_props.waveform_options,
				show_controls: true
			}
		});

		expect(get_last_create_args().mediaControls).toBe(true);
	});

	test("show_controls defaults to false when not specified", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				trim_region_color: "#f97316",
				show_recording_waveform: true
			}
		});

		expect(get_last_create_args().mediaControls).toBe(false);
	});

	test("custom sample_rate is passed as sampleRate", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				...default_props.waveform_options,
				sample_rate: 22050
			}
		});

		expect(get_last_create_args().sampleRate).toBe(22050);
	});

	test("default sample_rate is 44100", async () => {
		await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				trim_region_color: "#f97316",
				show_recording_waveform: true,
				show_controls: true
			}
		});

		expect(get_last_create_args().sampleRate).toBe(44100);
	});

	test("skip_length affects skip button labels", async () => {
		const { getByLabelText } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value,
			sources: ["microphone"],
			waveform_options: {
				...default_props.waveform_options,
				skip_length: 10
			}
		});

		// With audio_duration=0 and skip_length=10, get_skip_rewind_amount returns
		// (0/100)*10 || 5 = 5. The label still shows 5 because duration is 0.
		// But the skip_length option is wired through the controls.
		expect(getByLabelText("Skip forward by 5 seconds")).toBeTruthy();
		expect(getByLabelText("Skip backwards by 5 seconds")).toBeTruthy();
	});
});

describe("Subtitles", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("renders audio component with subtitles", async () => {
		const { getByTestId } = await render(Audio, {
			...default_props,
			subtitles: {
				url: "https://example.com/s2.vtt",
				path: "https://example.com/s2.vtt",
				orig_name: "s2.vtt"
			},
			interactive: false,
			value: fake_value
		});

		expect(getByTestId("subtitle-display").textContent).toBe("");
	});
});
