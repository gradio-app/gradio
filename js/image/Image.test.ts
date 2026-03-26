import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import { tick } from "svelte";

import Image from "./Index.svelte";
import { get_coordinates_of_clicked_image } from "./shared/utils";

const fake_value = {
	path: "test.png",
	url: "https://example.com/test.png",
	orig_name: "test.png",
	size: 1024,
	mime_type: "image/png",
	is_stream: false
};

const loading_status = {
	status: "complete" as const,
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full" as const,
	type: "input" as const,
	stream_state: "closed" as const
};

const default_props = {
	sources: ["upload", "webcam", "clipboard"] as (
		| "upload"
		| "webcam"
		| "clipboard"
	)[],
	value: null as any,
	label: "Image",
	show_label: true,
	interactive: true,
	_selectable: false,
	height: 300,
	width: 300,
	streaming: false,
	stream_every: 1,
	pending: false,
	input_ready: true,
	placeholder: "",
	buttons: [] as (string | { value: string; id: number; icon: null })[],
	webcam_options: { mirror: false, constraints: {} },
	watermark: null,
	loading_status
};

run_shared_prop_tests({
	component: Image,
	name: "Image",
	base_props: {
		...default_props
	},
	has_label: false,
	has_validation_error: false
});

describe("Image", () => {
	afterEach(() => cleanup());

	test("renders with null value showing upload area", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			value: null
		});

		expect(getByLabelText("image.drop_to_upload")).toBeVisible();
	});

	test("renders image when value is set", async () => {
		const { container } = await render(Image, {
			...default_props,
			value: fake_value
		});

		const img = container.querySelector("img");
		expect(img).toBeTruthy();
		expect(img?.getAttribute("src")).toBe("https://example.com/test.png");
	});
});

describe("Props: sources", () => {
	afterEach(() => cleanup());

	test("multiple sources renders source selection buttons", async () => {
		const { getByTestId } = await render(Image, {
			...default_props,
			sources: ["upload", "webcam", "clipboard"]
		});

		const sourceSelect = getByTestId("source-select");
		expect(sourceSelect).toBeTruthy();
	});

	test("single upload source does not render source selection", async () => {
		const { queryByTestId, getByLabelText } = await render(Image, {
			...default_props,
			sources: ["upload"]
		});
		expect(getByLabelText("image.drop_to_upload")).toBeVisible();
		const sourceSelect = queryByTestId("source-select");
		expect(sourceSelect).toBeNull();
	});

	test("single clipboard source does render source selection", async () => {
		const { queryByTestId, getByLabelText } = await render(Image, {
			...default_props,
			sources: ["clipboard"]
		});
		expect(getByLabelText("Paste from clipboard")).toBeTruthy();
		const sourceSelect = queryByTestId("source-select");
		expect(sourceSelect).not.toBeNull();
	});

	test("clipboard and upload sources render paste and upload buttons", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			sources: ["upload", "clipboard"]
		});

		expect(getByLabelText("Upload file")).toBeTruthy();
		expect(getByLabelText("Paste from clipboard")).toBeTruthy();
	});

	test("upload and webcam sources render corresponding buttons", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			sources: ["upload", "webcam"]
		});

		expect(getByLabelText("Upload file")).toBeTruthy();
		expect(getByLabelText("Capture from camera")).toBeTruthy();
	});

	test("clicking webcam source button hides the upload area", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			sources: ["upload", "webcam"]
		});

		expect(getByLabelText("image.drop_to_upload")).toBeVisible();

		await fireEvent.click(getByLabelText("Capture from camera"));

		// Re-query after click to avoid stale references from potential rerenders
		expect(getByLabelText("image.drop_to_upload")).not.toBeVisible();
	});

	test("clicking upload source button shows the upload area again", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			sources: ["upload", "webcam"]
		});

		await fireEvent.click(getByLabelText("Capture from camera"));
		expect(getByLabelText("image.drop_to_upload")).not.toBeVisible();

		await fireEvent.click(getByLabelText("Upload file"));
		expect(getByLabelText("image.drop_to_upload")).toBeVisible();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true shows an upload area when value is null", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			interactive: true,
			value: null
		});

		expect(getByLabelText("image.drop_to_upload")).toBeTruthy();
	});

	test("interactive=false renders the image without upload controls", async () => {
		const { container, queryByLabelText } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: ["fullscreen"]
		});

		const img = container.querySelector("img");
		expect(img).toBeTruthy();
		// No upload area or source selection in static mode
		expect(queryByLabelText("image.drop_to_upload")).toBeNull();
		expect(queryByLabelText("Upload file")).toBeNull();
	});

	test("interactive=false with null value does not show upload area", async () => {
		const { queryByLabelText } = await render(Image, {
			...default_props,
			interactive: false,
			value: null
		});

		expect(queryByLabelText("image.drop_to_upload")).toBeNull();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("setting value triggers change event", async () => {
		const { listen, set_data } = await render(Image, {
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
			const { listen } = await render(Image, {
				...default_props,
				value: fake_value
			});

			const change = listen("change");
			// need to wait for state to flush
			await tick();
			await tick();

			expect(change).not.toHaveBeenCalled();
		}
	);

	test("changing value multiple times triggers change each time", async () => {
		const { listen, set_data } = await render(Image, {
			...default_props,
			value: null
		});

		const change = listen("change");

		const value_a = { ...fake_value, url: "https://example.com/a.png" };
		const value_b = { ...fake_value, url: "https://example.com/b.png" };

		await set_data({ value: value_a });
		await set_data({ value: value_b });

		expect(change).toHaveBeenCalledTimes(2);
	});

	test("setting value to null after a value triggers change", async () => {
		const { listen, set_data } = await render(Image, {
			...default_props,
			value: fake_value
		});

		const change = listen("change");

		await set_data({ value: null });

		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Props: buttons (static mode)", () => {
	afterEach(() => cleanup());

	test("buttons with download shows download link", async () => {
		const { container } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: ["download"]
		});

		const downloadLink = container.querySelector("a.download-link");
		expect(downloadLink).toBeTruthy();
		expect(downloadLink?.getAttribute("href")).toBe(
			"https://example.com/test.png"
		);
		expect(downloadLink?.getAttribute("download")).toBe("test.png");
	});

	test("buttons with fullscreen shows fullscreen button", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: ["fullscreen"]
		});

		expect(getByLabelText("Fullscreen")).toBeTruthy();
	});

	test("empty buttons array shows no action buttons", async () => {
		const { queryByLabelText } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: []
		});

		expect(queryByLabelText("Fullscreen")).toBeNull();
		expect(queryByLabelText("common.download")).toBeNull();
	});

	test("custom button renders and dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			buttons: [{ value: "Analyze", id: 7, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Analyze");

		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 7 });
	});
});

describe("Props: buttons (interactive mode)", () => {
	afterEach(() => cleanup());

	test("clear button appears when image has a value", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		const clearBtn = getByLabelText("Remove Image");
		expect(clearBtn).toBeTruthy();
	});

	test("clear button is not present when there is no image value", async () => {
		const { queryByLabelText, getByLabelText } = await render(Image, {
			...default_props,
			interactive: true,
			value: null
		});

		// Smoke test: component rendered
		expect(getByLabelText("image.drop_to_upload")).toBeTruthy();
		expect(queryByLabelText("Remove Image")).toBeNull();
	});

	test("clicking clear button removes the image and dispatches clear and input", async () => {
		const { getByLabelText, listen } = await render(Image, {
			...default_props,
			interactive: true,
			value: fake_value
		});

		const clear = listen("clear");
		const input = listen("input");
		const clearBtn = getByLabelText("Remove Image");

		await fireEvent.click(clearBtn);

		expect(clear).toHaveBeenCalledTimes(1);
		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("get_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the current value", async () => {
		const { get_data, set_data } = await render(Image, {
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

describe("Selectable", () => {
	afterEach(() => cleanup());

	test("selectable mode shows crosshair cursor on the image", async () => {
		const { container } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			_selectable: true,
			buttons: []
		});

		const frame = container.querySelector(".selectable");
		expect(frame).toBeTruthy();
	});

	test("non-selectable mode does not show crosshair cursor", async () => {
		const { container } = await render(Image, {
			...default_props,
			interactive: false,
			value: fake_value,
			_selectable: false,
			buttons: []
		});

		const frame = container.querySelector(".selectable");
		expect(frame).toBeNull();
	});
});

describe("get_coordinates_of_clicked_image", () => {
	function make_mock_event(
		clientX: number,
		clientY: number,
		imgProps: { naturalWidth: number; naturalHeight: number },
		rect: { left: number; top: number; width: number; height: number }
	): MouseEvent {
		const imgEl = document.createElement("img");
		Object.defineProperty(imgEl, "naturalWidth", {
			value: imgProps.naturalWidth
		});
		Object.defineProperty(imgEl, "naturalHeight", {
			value: imgProps.naturalHeight
		});
		imgEl.getBoundingClientRect = () => ({
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
			right: rect.left + rect.width,
			bottom: rect.top + rect.height,
			x: rect.left,
			y: rect.top,
			toJSON: () => {}
		});

		const container = document.createElement("div");
		container.appendChild(imgEl);

		return {
			currentTarget: container,
			clientX,
			clientY
		} as unknown as MouseEvent;
	}

	test("returns correct coordinates for a 1:1 scale image", () => {
		const evt = make_mock_event(
			50,
			50,
			{
				naturalWidth: 100,
				naturalHeight: 100
			},
			{
				left: 0,
				top: 0,
				width: 100,
				height: 100
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toEqual([50, 50]);
	});

	test("returns correct coordinates when image is scaled down", () => {
		// 200x200 natural, displayed at 100x100, click at (25, 25) in viewport
		const evt = make_mock_event(
			25,
			25,
			{
				naturalWidth: 200,
				naturalHeight: 200
			},
			{
				left: 0,
				top: 0,
				width: 100,
				height: 100
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toEqual([50, 50]);
	});

	test("accounts for container offset", () => {
		const evt = make_mock_event(
			60,
			70,
			{
				naturalWidth: 100,
				naturalHeight: 100
			},
			{
				left: 10,
				top: 20,
				width: 100,
				height: 100
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toEqual([50, 50]);
	});

	test("returns null when click is outside image bounds", () => {
		// Click at (-5, 50) relative to image → x = -5 which is < 0
		const evt = make_mock_event(
			-5,
			50,
			{
				naturalWidth: 100,
				naturalHeight: 100
			},
			{
				left: 0,
				top: 0,
				width: 100,
				height: 100
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toBeNull();
	});

	test("returns null when click is beyond the right edge", () => {
		const evt = make_mock_event(
			105,
			50,
			{
				naturalWidth: 100,
				naturalHeight: 100
			},
			{
				left: 0,
				top: 0,
				width: 100,
				height: 100
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toBeNull();
	});

	test("handles landscape image with letterboxing (xScale > yScale)", () => {
		// 400x200 natural image displayed in 200x200 container
		// xScale = 400/200 = 2, yScale = 200/200 = 1
		// xScale > yScale, so displayed_height = 200/2 = 100, y_offset = 50
		// Click at (100, 100): x = (100-0)*2 = 200, y = (100-0-50)*2 = 100
		const evt = make_mock_event(
			100,
			100,
			{
				naturalWidth: 400,
				naturalHeight: 200
			},
			{
				left: 0,
				top: 0,
				width: 200,
				height: 200
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toEqual([200, 100]);
	});

	test("handles portrait image with pillarboxing (yScale > xScale)", () => {
		// 200x400 natural image displayed in 200x200 container
		// xScale = 200/200 = 1, yScale = 400/200 = 2
		// yScale > xScale, so displayed_width = 200/2 = 100, x_offset = 50
		// Click at (100, 100): x = (100-0-50)*2 = 100, y = (100-0)*2 = 200
		const evt = make_mock_event(
			100,
			100,
			{
				naturalWidth: 200,
				naturalHeight: 400
			},
			{
				left: 0,
				top: 0,
				width: 200,
				height: 200
			}
		);

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toEqual([100, 200]);
	});

	test("returns [NaN, NaN] when currentTarget is not an Element", () => {
		const evt = {
			currentTarget: {},
			clientX: 50,
			clientY: 50
		} as unknown as MouseEvent;

		const result = get_coordinates_of_clicked_image(evt);
		expect(result).toEqual([NaN, NaN]);
	});
});

const mock_stream = vi.fn().mockResolvedValue({
	onmessage: null,
	onerror: null,
	close: vi.fn()
});

function make_upload_props(upload_impl?: (...args: any[]) => Promise<any>) {
	const uploaded_file_data = {
		path: "uploaded.png",
		url: "https://example.com/uploaded.png",
		orig_name: "uploaded.png",
		size: 2048,
		mime_type: "image/png",
		is_stream: false
	};
	const mock_upload =
		upload_impl ?? vi.fn().mockResolvedValue([uploaded_file_data]);
	return {
		props: {
			...default_props,
			sources: ["upload"] as "upload"[],
			interactive: true,
			value: null,
			root: "https://example.com",
			client: { upload: mock_upload, stream: mock_stream }
		},
		mock_upload,
		uploaded_file_data
	};
}

function create_test_file(): File {
	return new File(["fake image data"], "photo.png", {
		type: "image/png"
	});
}

describe("Events: upload via file input", () => {
	afterEach(() => cleanup());

	test("selecting a file triggers upload, change, and input events", async () => {
		const { props, mock_upload, uploaded_file_data } = make_upload_props();
		const { container, listen } = await render(Image, props);

		const upload = listen("upload");
		const change = listen("change");
		const input = listen("input");

		const file_input = container.querySelector(
			"[data-testid='file-upload']"
		) as HTMLInputElement;
		expect(file_input).toBeTruthy();

		const file = create_test_file();
		Object.defineProperty(file_input, "files", {
			value: [file],
			writable: false
		});
		await fireEvent.change(file_input);

		await waitFor(() => {
			expect(mock_upload).toHaveBeenCalled();
		});

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
		const { props } = make_upload_props(failing_upload);
		const { container, listen } = await render(Image, props);

		const error = listen("error");

		const file_input = container.querySelector(
			"[data-testid='file-upload']"
		) as HTMLInputElement;

		const file = create_test_file();
		Object.defineProperty(file_input, "files", {
			value: [file],
			writable: false
		});
		await fireEvent.change(file_input);

		await waitFor(() => {
			expect(failing_upload).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith("File too large");
	});
});
