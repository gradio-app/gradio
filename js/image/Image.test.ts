import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import { tick } from "svelte";

import Image from "./Index.svelte";

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
		const { getByTestId } = await render(Image, {
			...default_props,
			value: null
		});

		const image = getByTestId("image");
		expect(image).toBeTruthy();
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
		const { queryByTestId } = await render(Image, {
			...default_props,
			sources: ["upload"]
		});

		const sourceSelect = queryByTestId("source-select");
		expect(sourceSelect).toBeNull();
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

		const uploadArea = getByLabelText("image.drop_to_upload");
		expect(uploadArea).toBeVisible();

		await fireEvent.click(getByLabelText("Capture from camera"));

		expect(uploadArea).not.toBeVisible();
	});

	test("clicking upload source button shows the upload area again", async () => {
		const { getByLabelText } = await render(Image, {
			...default_props,
			sources: ["upload", "webcam"]
		});

		const uploadArea = getByLabelText("image.drop_to_upload");

		await fireEvent.click(getByLabelText("Capture from camera"));
		expect(uploadArea).not.toBeVisible();

		await fireEvent.click(getByLabelText("Upload file"));
		expect(uploadArea).toBeVisible();
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

	test("change event is not triggered on mount with a default value", async () => {
		const { listen } = await render(Image, {
			...default_props,
			value: fake_value
		});

		const change = listen("change");
		// need to wait for state to flush
		await tick();
		await tick();

		expect(change).not.toHaveBeenCalled();
	});

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

describe("Download button", () => {
	afterEach(() => cleanup());

	test("download link has correct href and download attributes", async () => {
		const { container } = await render(Image, {
			...default_props,
			interactive: false,
			value: {
				...fake_value,
				orig_name: "my_photo.jpg",
				url: "https://example.com/my_photo.jpg"
			},
			buttons: ["download"]
		});

		const downloadLink = container.querySelector(
			"a.download-link"
		) as HTMLAnchorElement;
		expect(downloadLink).toBeTruthy();
		expect(downloadLink.href).toBe("https://example.com/my_photo.jpg");
		expect(downloadLink.download).toBe("my_photo.jpg");
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
