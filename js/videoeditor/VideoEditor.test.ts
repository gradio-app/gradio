import { describe, test, expect, afterEach } from "vitest";
import {
	render,
	cleanup,
	mock_client,
	TEST_MP4
} from "@self/tootils/render";
import Index from "./Index.svelte";

const default_props = {
	interactive: true,
	label: "VideoEditor",
	show_label: true,
	value: null,
	root: "http://localhost:7860",
	client: mock_client(),
	brush_color: "rgba(255, 0, 0, 0.5)",
	brush_size: 20
};

describe("VideoEditor", () => {
	afterEach(() => cleanup());

	test("renders the upload area when there is no value", async () => {
		const { container } = await render(Index, default_props);
		const file_input = container.querySelector("input[type='file']");
		expect(file_input).not.toBeNull();
		expect(file_input?.getAttribute("accept")).toContain("video");
	});

	test("renders 'No video' when not interactive and no value", async () => {
		const { getByText } = await render(Index, {
			...default_props,
			interactive: false
		});
		expect(getByText("No video")).toBeInTheDocument();
	});

	test("renders the video player when a video value is provided", async () => {
		const { container } = await render(Index, {
			...default_props,
			value: { video: TEST_MP4, mask: null }
		});
		const video = container.querySelector("video");
		expect(video?.getAttribute("src")).toBe(TEST_MP4.url);
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true shows draw and clear controls", async () => {
		const { getByLabelText } = await render(Index, {
			...default_props,
			value: { video: TEST_MP4, mask: null }
		});
		expect(getByLabelText(/draw/i)).toBeInTheDocument();
		expect(getByLabelText(/clear mask/i)).toBeInTheDocument();
	});

	test("interactive=false hides the controls", async () => {
		const { queryByLabelText } = await render(Index, {
			...default_props,
			interactive: false,
			value: { video: TEST_MP4, mask: null }
		});
		expect(queryByLabelText(/draw mask/i)).toBeNull();
		expect(queryByLabelText(/clear mask/i)).toBeNull();
	});
});

describe("get_data", () => {
	afterEach(() => cleanup());

	test("returns the video and no mask when nothing has been drawn", async () => {
		const { get_data } = await render(Index, {
			...default_props,
			value: { video: TEST_MP4, mask: null }
		});
		const data = await get_data();
		expect(data.value).toMatchObject({
			video: expect.objectContaining({ url: TEST_MP4.url })
		});
		expect(data.value?.mask ?? null).toBeNull();
	});
});
