import {
	test,
	describe,
	assert,
	afterEach,
	vi,
	beforeAll,
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
	TEST_MP4
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import { setupi18n } from "../core/src/i18n";

vi.mock("@ffmpeg/ffmpeg", () => ({
	FFmpeg: class MockFFmpeg {
		load = vi.fn(() => Promise.resolve());
		writeFile = vi.fn(() => Promise.resolve());
		readFile = vi.fn(() => Promise.resolve(new Uint8Array()));
		exec = vi.fn(() => Promise.resolve(0));
		terminate = vi.fn(() => Promise.resolve());
		on = vi.fn();
	}
}));

vi.mock("@ffmpeg/util", () => ({
	fetchFile: vi.fn(() => Promise.resolve(new Uint8Array())),
	toBlobURL: vi.fn(() => Promise.resolve("blob:mock"))
}));

import Video from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";

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
	path: "video_sample.mp4",
	url: "https://example.com/video_sample.mp4",
	orig_name: "video_sample.mp4",
	size: 261179,
	mime_type: "video/mp4",
	is_stream: false
};

const default_props = {
	loading_status,
	label: "Video",
	show_label: true,
	value: null as any,
	sources: ["upload", "webcam"] as ("upload" | "webcam")[],
	interactive: true,
	streaming: false,
	pending: false,
	autoplay: false,
	loop: false,
	webcam_options: { mirror: false, constraints: {} },
	buttons: [] as (string | { value: string; id: number; icon: null })[]
};

beforeAll(() => {
	window.HTMLMediaElement.prototype.play = vi.fn();
	window.HTMLMediaElement.prototype.pause = vi.fn();
});

run_shared_prop_tests({
	component: Video,
	name: "Video",
	base_props: {
		...default_props
	},
	has_label: false,
	has_validation_error: false
});

describe("Video", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("renders upload area when value is null", async () => {
		const { getByLabelText } = await render(Video, {
			...default_props,
			sources: ["upload"],
			value: null
		});

		expect(getByLabelText("video.drop_to_upload")).toBeVisible();
	});

	test("renders video player when value is set", async () => {
		const { getByTestId } = await render(Video, {
			...default_props,
			label: "Test Video",
			value: fake_value
		});

		const vid = getByTestId("Test Video-player") as HTMLVideoElement;
		expect(vid).toBeTruthy();
		expect(vid.src).toContain("video_sample.mp4");
	});
});

describe("Props: sources", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("multiple sources renders source selection buttons", async () => {
		const { getByTestId } = await render(Video, {
			...default_props,
			sources: ["upload", "webcam"]
		});

		expect(getByTestId("source-select")).toBeTruthy();
	});

	test("single upload source does not render source selection", async () => {
		const { queryByTestId } = await render(Video, {
			...default_props,
			sources: ["upload"]
		});

		expect(queryByTestId("source-select")).toBeNull();
	});

	test("upload and webcam sources render corresponding buttons", async () => {
		const { getByLabelText } = await render(Video, {
			...default_props,
			sources: ["upload", "webcam"]
		});

		expect(getByLabelText("Upload file")).toBeTruthy();
		expect(getByLabelText("Capture from camera")).toBeTruthy();
	});
});

describe("Props: interactive", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("interactive=true shows upload area when value is null", async () => {
		const { getByLabelText } = await render(Video, {
			...default_props,
			interactive: true,
			sources: ["upload"],
			value: null
		});

		expect(getByLabelText("video.drop_to_upload")).toBeTruthy();
	});

	test("interactive=false renders the video without upload controls", async () => {
		const { queryByLabelText } = await render(Video, {
			...default_props,
			interactive: false,
			value: fake_value
		});

		expect(queryByLabelText("video.drop_to_upload")).toBeNull();
		expect(queryByLabelText("Upload file")).toBeNull();
	});

	test("interactive=false with null value does not show upload area", async () => {
		const { queryByLabelText } = await render(Video, {
			...default_props,
			interactive: false,
			value: null
		});

		expect(queryByLabelText("video.drop_to_upload")).toBeNull();
	});
});

describe("Events: change", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("setting value triggers change event", async () => {
		const { listen, set_data } = await render(Video, {
			...default_props,
			value: null
		});

		const change = listen("change");

		await set_data({ value: fake_value });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test.todo(
		"change event is not triggered on mount with a default value",
		async () => {
			const { listen } = await render(Video, {
				...default_props,
				value: fake_value
			});

			const change = listen("change", { retrospective: true });

			expect(change).not.toHaveBeenCalled();
		}
	);

	test("changing value multiple times triggers change each time", async () => {
		const { listen, set_data } = await render(Video, {
			...default_props,
			value: null
		});

		const change = listen("change");

		const value_a = { ...fake_value, url: "https://example.com/a.mp4" };
		const value_b = { ...fake_value, url: "https://example.com/b.mp4" };

		await set_data({ value: value_a });
		await set_data({ value: value_b });

		expect(change).toHaveBeenCalledTimes(2);
	});

	test("setting value to null after a value triggers change", async () => {
		const { listen, set_data } = await render(Video, {
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

	test("buttons with download shows download button", async () => {
		const { getAllByTestId } = await render(Video, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: ["download"]
		});

		const downloadDiv = getAllByTestId("download-div")[0];
		expect(downloadDiv).toBeTruthy();
		const link = downloadDiv.querySelector("a");
		expect(link?.getAttribute("href")).toContain("video_sample.mp4");
	});

	test("custom button renders and dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(Video, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: [{ value: "Analyze", id: 5, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Analyze");

		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 5 });
	});
});

describe("Props: buttons (interactive mode)", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("clear button appears when video has a value", async () => {
		const { getByLabelText } = await render(Video, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		const clearBtn = getByLabelText("common.clear");
		expect(clearBtn).toBeTruthy();
	});

	test("clicking clear button removes the video and dispatches clear and input", async () => {
		const { getByLabelText, listen } = await render(Video, {
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
		const { get_data, set_data } = await render(Video, {
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

describe("Autoplay", () => {
	setupi18n();
	afterEach(() => cleanup());

	test("autoplay calls media.play in static mode", async () => {
		const { getByTestId } = await render(Video, {
			...default_props,
			interactive: false,
			value: fake_value,
			autoplay: true
		});

		const video = getByTestId("Video-player") as HTMLVideoElement;
		const fn = vi.spyOn(video, "play").mockResolvedValue(undefined);
		video.dispatchEvent(new Event("loadeddata"));
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("autoplay calls media.play in interactive mode", async () => {
		const { getByTestId } = await render(Video, {
			...default_props,
			interactive: true,
			value: fake_value,
			autoplay: true
		});

		const video = getByTestId("Video-player") as HTMLVideoElement;
		const fn = vi.spyOn(video, "play").mockResolvedValue(undefined);
		video.dispatchEvent(new Event("loadeddata"));
		expect(fn).toHaveBeenCalled();
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
		const { listen } = await render(Video, upload_props);

		const upload = listen("upload");
		const change = listen("change");
		const input = listen("input");

		await upload_file(TEST_MP4);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(input).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("drag and drop a file triggers upload, change, and input events", async () => {
		const { listen } = await render(Video, upload_props);

		const upload = listen("upload");
		const change = listen("change");
		const input = listen("input");

		await drop_file(TEST_MP4, "[aria-label='video.drop_to_upload']");

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
		const { listen } = await render(Video, {
			...upload_props,
			client: {
				upload: failing_upload,
				stream: async () => ({ onmessage: null, close: () => {} })
			}
		});

		const error = listen("error");

		await upload_file(TEST_MP4);

		await waitFor(() => {
			expect(failing_upload).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith("File too large");
	});
});
