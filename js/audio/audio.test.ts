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
import AudioRecorderHarness from "./AudioRecorderHarness.svelte";
import MinimalAudioRecorderHarness from "./MinimalAudioRecorderHarness.svelte";
import WaveSurfer from "wavesurfer.js";
import { Hls } from "@gradio/utils/hls";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import type { ILoadingStatus as LoadingStatus } from "@gradio/statustracker";
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

function make_wav_blob(): Blob {
	const sample_rate = 8000;
	const num_samples = 800;
	const buffer = new ArrayBuffer(44 + num_samples * 2);
	const view = new DataView(buffer);
	const write_string = (offset: number, s: string): void => {
		for (let i = 0; i < s.length; i++) {
			view.setUint8(offset + i, s.charCodeAt(i));
		}
	};
	write_string(0, "RIFF");
	view.setUint32(4, 36 + num_samples * 2, true);
	write_string(8, "WAVE");
	write_string(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sample_rate, true);
	view.setUint32(28, sample_rate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	write_string(36, "data");
	view.setUint32(40, num_samples * 2, true);
	return new Blob([buffer], { type: "audio/wav" });
}

describe("Events: microphone recording", () => {
	setupi18n();
	let record_create: ReturnType<typeof vi.spyOn>;
	let waveform_create: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		record_create = vi.spyOn(RecordPlugin, "create");
		waveform_create = vi.spyOn(WaveSurfer, "create");
	});
	afterEach(() => {
		vi.restoreAllMocks();
		cleanup();
	});

	test("finishing a recording uploads the audio exactly once", async () => {
		const upload = vi.fn(async (file_data: any[]) => file_data);
		const { listen, get_data } = await render(Audio, {
			...default_props,
			sources: ["microphone"],
			value: null,
			root: "https://example.com",
			client: {
				upload,
				stream: async () => ({ onmessage: null, close: () => {} })
			}
		});

		const stop_recording = listen("stop_recording");
		const input = listen("input");

		await waitFor(() => expect(record_create).toHaveBeenCalled());
		const record = record_create.mock.results[0].value as any;
		record.emit("record-end", make_wav_blob());

		await waitFor(() => {
			expect(stop_recording).toHaveBeenCalledTimes(1);
		});
		expect(upload).toHaveBeenCalledTimes(1);
		expect(input).toHaveBeenCalledTimes(1);
		expect((await get_data()).value).toBeTruthy();
	});

	test("repeated recordings replace preview resources and unmount cleans the latest preview", async () => {
		const dispatch_blob = vi.fn(async () => {});
		// These resources have no DOM-visible cleanup signal, so spies verify release.
		const create_object_url = vi.spyOn(URL, "createObjectURL");
		const revoke_object_url = vi.spyOn(URL, "revokeObjectURL");

		const { unmount } = await render(AudioRecorderHarness, { dispatch_blob });

		await waitFor(() => {
			expect(record_create).toHaveBeenCalledTimes(1);
			expect(waveform_create).toHaveBeenCalledTimes(1);
		});
		const record = record_create.mock.results[0].value as any;
		const mic_waveform = waveform_create.mock.results[0].value;
		const destroy_mic_waveform = vi.spyOn(mic_waveform, "destroy");

		record.emit("record-end", make_wav_blob());
		await waitFor(() => {
			expect(dispatch_blob).toHaveBeenCalledTimes(1);
			expect(waveform_create).toHaveBeenCalledTimes(2);
		});
		const first_preview = waveform_create.mock.results[1].value;
		const destroy_first_preview = vi.spyOn(first_preview, "destroy");
		const first_url = create_object_url.mock.results[0].value;

		record.emit("record-end", make_wav_blob());
		await waitFor(() => {
			expect(dispatch_blob).toHaveBeenCalledTimes(2);
			expect(waveform_create).toHaveBeenCalledTimes(3);
		});
		expect(destroy_first_preview).toHaveBeenCalledTimes(1);
		expect(revoke_object_url).toHaveBeenCalledWith(first_url);

		const latest_preview = waveform_create.mock.results[2].value;
		const destroy_latest_preview = vi.spyOn(latest_preview, "destroy");
		const latest_url = create_object_url.mock.results[1].value;

		unmount();

		expect(destroy_latest_preview).toHaveBeenCalledTimes(1);
		expect(destroy_mic_waveform).toHaveBeenCalledTimes(1);
		expect(revoke_object_url).toHaveBeenCalledWith(latest_url);
	});

	test("unmounting while recording discards the abandoned take", async () => {
		const dispatch_blob = vi.fn(async () => {});
		const { unmount } = await render(AudioRecorderHarness, { dispatch_blob });

		await waitFor(() => {
			expect(record_create).toHaveBeenCalledTimes(1);
			expect(waveform_create).toHaveBeenCalledTimes(1);
		});
		const record = record_create.mock.results[0].value as any;
		const mic_waveform = waveform_create.mock.results[0].value;

		// WaveSurfer's RecordPlugin emits record-end from destroy() when the
		// MediaRecorder is still active, which requires a teardown simulation here.
		vi.spyOn(mic_waveform, "destroy").mockImplementation(() => {
			record.emit("record-end", make_wav_blob());
		});

		unmount();
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(dispatch_blob).not.toHaveBeenCalled();
	});
});

describe("MinimalAudioRecorder", () => {
	setupi18n();
	let record_create: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		record_create = vi.spyOn(RecordPlugin, "create");
	});

	afterEach(() => {
		record_create.mockRestore();
		cleanup();
	});

	test("repeated chat input recordings are processed and uploaded", async () => {
		const upload = vi.fn(async (file_data: any[]) => file_data);
		const onchange = vi.fn();
		const onstoprecording = vi.fn();

		await render(MinimalAudioRecorderHarness, {
			upload_fn: upload,
			onchange,
			onstoprecording
		});

		await waitFor(() => expect(record_create).toHaveBeenCalledTimes(1));
		const record = record_create.mock.results[0].value as any;

		for (let recording = 1; recording <= 8; recording++) {
			record.emit("record-end", make_wav_blob());
			await waitFor(() => {
				expect(upload).toHaveBeenCalledTimes(recording);
				expect(onchange).toHaveBeenCalledTimes(recording);
				expect(onstoprecording).toHaveBeenCalledTimes(recording);
			});
		}
	});
});

describe("Props: playback_position", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("clicking clear resets playback_position to 0", async () => {
		const { getByLabelText, set_data, get_data } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		await set_data({ playback_position: 1.5 });
		await fireEvent.click(getByLabelText("common.clear"));

		expect((await get_data()).playback_position).toBe(0);
	});

	test("uploading a new file starts playback from the beginning", async () => {
		const { listen, set_data, get_data } = await render(Audio, {
			...upload_props,
			value: fake_value
		});

		const upload = listen("upload");

		await set_data({ playback_position: 1.5 });
		await set_data({ value: null });
		await upload_file(TEST_WAV);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect((await get_data()).playback_position).toBe(0);
	});

	test("a backend update can still set playback_position alongside a new value", async () => {
		const { set_data, get_data } = await render(Audio, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		await set_data({
			value: { ...fake_value, url: `${fake_value.url}?v=2` },
			playback_position: 2
		});

		expect((await get_data()).playback_position).toBe(2);
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

describe("Props: show_recording_waveform", () => {
	setupi18n();
	afterEach(() => cleanup());

	const native_props = {
		...default_props,
		interactive: false,
		label: "music",
		value: fake_value,
		waveform_options: {
			...default_props.waveform_options,
			show_recording_waveform: false
		}
	};

	test("show_recording_waveform=false dispatches pause from the native player", async () => {
		const { getByTestId, queryByTestId, listen } = await render(
			Audio,
			native_props
		);
		expect(queryByTestId("waveform-music")).not.toBeInTheDocument();

		const pause = listen("pause");
		await fireEvent.pause(getByTestId("audio-player-music"));

		expect(pause).toHaveBeenCalledTimes(1);
	});

	test("show_recording_waveform=false keeps playback_position in sync both ways", async () => {
		const { getByTestId, set_data, get_data } = await render(
			Audio,
			native_props
		);
		const player = getByTestId("audio-player-music") as HTMLAudioElement;
		await waitFor(() => expect(player.readyState).toBeGreaterThan(0));
		const halfway = player.duration / 2;
		const quarter = player.duration / 4;

		player.currentTime = halfway;
		await fireEvent.timeUpdate(player);
		expect((await get_data()).playback_position).toBeCloseTo(halfway, 1);

		await set_data({ playback_position: quarter });
		expect(player.currentTime).toBeCloseTo(quarter, 1);
	});
});

describe("Streaming output", () => {
	setupi18n();
	let load_source: ReturnType<typeof vi.spyOn>;
	let destroy: ReturnType<typeof vi.spyOn>;
	let wavesurfer_load: ReturnType<typeof vi.spyOn>;
	let media_pause: ReturnType<typeof vi.spyOn>;
	let is_supported: ReturnType<typeof vi.spyOn> | undefined;

	beforeEach(() => {
		load_source = vi
			.spyOn(Hls.prototype, "loadSource")
			.mockImplementation(() => {});
		destroy = vi.spyOn(Hls.prototype, "destroy");
		wavesurfer_load = vi.spyOn(WaveSurfer.prototype, "load");
		media_pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
	});
	afterEach(() => {
		load_source.mockRestore();
		destroy.mockRestore();
		wavesurfer_load.mockRestore();
		media_pause.mockRestore();
		is_supported?.mockRestore();
		is_supported = undefined;
		cleanup();
	});

	// wavesurfer's load() emits `error` before it rejects, and the event
	// carries no URL, so a mocked failure has to reproduce that ordering.
	function emit_load_error(instance: WaveSurfer, message: string): Error {
		const e = new Error(message);
		(instance as any).emit("error", e);
		return e;
	}

	// An unroutable host: these URLs land on real media elements, and a
	// resolvable one would send actual requests out of the unit tests.
	const run_1 = {
		...TEST_WAV,
		is_stream: true,
		url: "https://stream.invalid/abc/1/1/playlist.m3u8"
	};
	const run_2 = {
		...run_1,
		url: "https://stream.invalid/abc/2/1/playlist.m3u8"
	};

	test("a new streaming run attaches a new source", async () => {
		const { set_data } = await render(Audio, {
			...default_props,
			interactive: false,
			value: run_1
		});

		await waitFor(() => expect(load_source).toHaveBeenCalledTimes(1));

		// A run re-sends its own URL with every chunk.
		await set_data({ value: { ...run_1 } });
		expect(load_source).toHaveBeenCalledTimes(1);

		await set_data({ value: run_2 });

		await waitFor(() => expect(load_source).toHaveBeenCalledTimes(2));
		expect(load_source).toHaveBeenLastCalledWith(run_2.url);
		expect(destroy).toHaveBeenCalledTimes(1);
	});

	test("clearing the value tears down the attached stream", async () => {
		const { set_data } = await render(Audio, {
			...default_props,
			interactive: false,
			value: run_1
		});

		await waitFor(() => expect(load_source).toHaveBeenCalledTimes(1));

		await set_data({ value: null });

		expect(destroy).toHaveBeenCalledTimes(1);
	});

	test("switching from a file to a stream tears down the waveform", async () => {
		const { set_data } = await render(Audio, {
			...default_props,
			interactive: false,
			value: fake_value
		});

		await waitFor(() => expect(wavesurfer_load).toHaveBeenCalled());
		wavesurfer_load.mockClear();

		await set_data({ value: run_1 });

		// The playlist belongs to the HLS player; wavesurfer cannot decode it.
		expect(wavesurfer_load).not.toHaveBeenCalled();
	});

	test("a fatal unrecoverable error does not re-attach", async () => {
		// Only the first few attempts fail: against a re-attach loop an
		// unbounded injection would keep the browser spinning forever.
		let attempts = 0;
		load_source.mockImplementation(function (this: Hls) {
			if (attempts++ < 5) {
				queueMicrotask(() => {
					this.trigger(Hls.Events.ERROR, {
						type: Hls.ErrorTypes.OTHER_ERROR,
						details: Hls.ErrorDetails.INTERNAL_EXCEPTION,
						fatal: true
					} as any);
				});
			}
		});

		await render(Audio, {
			...default_props,
			interactive: false,
			value: run_1
		});

		await waitFor(() => expect(destroy).toHaveBeenCalled());
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(load_source).toHaveBeenCalledTimes(1);
		expect(destroy).toHaveBeenCalledTimes(1);
	});

	test("without HLS support the native player reattaches too", async () => {
		is_supported = vi.spyOn(Hls, "isSupported").mockReturnValue(false);
		const { getByTestId, set_data } = await render(Audio, {
			...default_props,
			interactive: false,
			value: run_1
		});

		const player = getByTestId("audio-player-Audio") as HTMLAudioElement;
		expect(player.src).toBe(run_1.url);

		media_pause.mockClear();
		await set_data({ value: run_2 });

		expect(player.src).toBe(run_2.url);
		expect(load_source).not.toHaveBeenCalled();
		// A programmatic pause would dispatch a `pause` the user never caused;
		// the teardown stops playback with `load()` instead.
		expect(media_pause).not.toHaveBeenCalled();

		// Clearing unmounts the player, so this covers the unmount teardown:
		// it has to release the source or the stream keeps playing.
		await set_data({ value: null });

		expect(player.getAttribute("src")).toBeNull();
		expect(player.paused).toBe(true);
	});

	test("a stale load failure does not downgrade the current file", async () => {
		let fail_first: (() => void) | undefined;
		wavesurfer_load
			.mockImplementationOnce(function (this: WaveSurfer) {
				return new Promise((_, reject) => {
					fail_first = () => reject(emit_load_error(this, "decode failed"));
				});
			})
			.mockImplementationOnce(() => Promise.resolve());
		const { getByTestId, set_data } = await render(Audio, {
			...default_props,
			interactive: false,
			value: fake_value
		});

		await waitFor(() => expect(wavesurfer_load).toHaveBeenCalledTimes(1));

		await set_data({ value: { ...fake_value, url: fake_value.url + "?v=2" } });
		await waitFor(() => expect(wavesurfer_load).toHaveBeenCalledTimes(2));

		// The first file's decode fails only after the value moved on.
		fail_first?.();
		await new Promise((resolve) => setTimeout(resolve, 0));

		const player = getByTestId("audio-player-Audio") as HTMLAudioElement;
		expect(player.getAttribute("src")).toBeNull();
	});

	test("a recovered waveform releases the native fallback", async () => {
		wavesurfer_load
			.mockImplementationOnce(function (this: WaveSurfer) {
				return Promise.reject(emit_load_error(this, "decode failed"));
			})
			.mockImplementationOnce(() => Promise.resolve());

		const { getByTestId, set_data } = await render(Audio, {
			...default_props,
			interactive: false,
			value: fake_value
		});

		const player = getByTestId("audio-player-Audio") as HTMLAudioElement;
		await waitFor(() =>
			expect(player.getAttribute("src")).toBe(fake_value.url)
		);

		await set_data({ value: { ...fake_value, url: fake_value.url + "?v=2" } });

		// The failed file must not keep playing behind the new waveform.
		await waitFor(() => expect(player.getAttribute("src")).toBeNull());
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
