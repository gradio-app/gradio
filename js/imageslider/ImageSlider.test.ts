import { test, describe, afterEach, expect, vi } from "vitest";
import {
	cleanup,
	render,
	fireEvent,
	waitFor,
	upload_file,
	mock_client,
	TEST_JPG
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import type { FileData } from "@gradio/client";

import ImageSlider from "./Index.svelte";

const fake_image = (id: string): FileData => ({
	path: `${id}.png`,
	url: `https://example.com/${id}.png`,
	orig_name: `${id}.png`,
	size: 1024,
	mime_type: "image/png",
	is_stream: false,
	meta: { _type: "gradio.FileData" }
});

const img_a = fake_image("img_a");
const img_b = fake_image("img_b");

const default_props = {
	value: [null, null] as [FileData | null, FileData | null],
	label: "ImageSlider",
	show_label: true,
	interactive: false,
	buttons: [] as (string | { value: string; id: number; icon: null })[],
	slider_position: 50,
	input_ready: true,
	upload_count: 2,
	slider_color: "#ff0000",
	max_height: 500
};

// interactive: false ensures SliderPreview is rendered for elem_id/elem_classes/visible tests.
// has_label: false because BlockLabel's show_label=false uses class:hide (display:none) but
// is applied directly on the <label> element, not on a data-testid='block-info' wrapper that
// the shared test expects. Custom label tests are below.
run_shared_prop_tests({
	component: ImageSlider,
	name: "ImageSlider",
	base_props: { ...default_props },
	has_label: false
});

describe("Props: label", () => {
	afterEach(() => cleanup());

	test("label text is rendered", async () => {
		const { getByTestId } = await render(ImageSlider, {
			...default_props,
			label: "My Comparison"
		});

		expect(getByTestId("block-label")).toHaveTextContent("My Comparison");
	});

	test("show_label: true makes the label visible", async () => {
		const { getByTestId } = await render(ImageSlider, {
			...default_props,
			show_label: true
		});

		expect(getByTestId("block-label")).toBeVisible();
	});

	test("show_label: false hides the label", async () => {
		const { getByTestId } = await render(ImageSlider, {
			...default_props,
			show_label: false
		});

		// BlockLabel uses class:hide (display:none) when show_label=false
		expect(getByTestId("block-label")).not.toBeVisible();
	});
});

describe("ImageSlider", () => {
	afterEach(() => cleanup());

	test("renders empty state when non-interactive with no images", async () => {
		const { queryAllByTestId } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [null, null]
		});

		expect(queryAllByTestId("imageslider-image")).toHaveLength(0);
	});

	test("renders upload area when interactive with no images", async () => {
		// Upload component renders two buttons (one per slot); getAllByRole handles both
		const { getAllByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			client: mock_client()
		});

		const btns = getAllByRole("button", {
			name: "Click to upload or drop files"
		});
		expect(btns[0]).toBeVisible();
	});

	test("renders both images when value has two images", async () => {
		const { getAllByTestId } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b]
		});

		expect(getAllByTestId("imageslider-image").length).toBeGreaterThan(0);
	});
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("[null, null] + interactive shows upload area", async () => {
		// Two upload buttons (one per slot); getAllByRole avoids "multiple elements" error
		const { getAllByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			client: mock_client()
		});

		const btns = getAllByRole("button", {
			name: "Click to upload or drop files"
		});
		expect(btns[0]).toBeVisible();
	});

	test("both images show their URLs in <img> src attributes", async () => {
		const { getAllByTestId } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b]
		});

		const imgs = getAllByTestId("imageslider-image");
		const srcs = imgs.map((img) => (img as HTMLImageElement).src);
		expect(srcs).toContain("https://example.com/img_a.png");
		expect(srcs).toContain("https://example.com/img_b.png");
	});

	test("[img, null] + interactive shows upload mode (second image missing)", async () => {
		const { getByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, null],
			client: mock_client()
		});

		expect(
			getByRole("button", { name: "Click to upload or drop files" })
		).toBeVisible();
	});

	test("[null, img] + interactive shows upload mode (first image missing)", async () => {
		const { getByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, img_b],
			client: mock_client()
		});

		expect(
			getByRole("button", { name: "Click to upload or drop files" })
		).toBeVisible();
	});

	test("[img, img] + interactive switches to preview mode", async () => {
		const { getAllByTestId, queryByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, img_b]
		});

		expect(
			queryByRole("button", { name: "Click to upload or drop files" })
		).toBeNull();
		expect(getAllByTestId("imageslider-image").length).toBeGreaterThan(0);
	});

	test("set_data with both images updates DOM with correct src values", async () => {
		const { set_data, getAllByTestId } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		await set_data({ value: [img_a, img_b] });

		const imgs = getAllByTestId("imageslider-image");
		const srcs = imgs.map((img) => (img as HTMLImageElement).src);
		expect(srcs).toContain("https://example.com/img_a.png");
		expect(srcs).toContain("https://example.com/img_b.png");
	});

	test("set_data with [null, null] removes images from DOM", async () => {
		const { set_data, queryAllByTestId } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [img_a, img_b]
		});

		await set_data({ value: [null, null] });

		expect(queryAllByTestId("imageslider-image")).toHaveLength(0);
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive: false with no images shows static empty state without file inputs", async () => {
		const { queryByTestId } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [null, null]
		});

		expect(queryByTestId("file-upload")).toBeNull();
	});

	test("interactive: true with no images shows upload area", async () => {
		// Two upload buttons (one per slot); getAllByRole avoids "multiple elements" error
		const { getAllByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			client: mock_client()
		});

		const btns = getAllByRole("button", {
			name: "Click to upload or drop files"
		});
		expect(btns[0]).toBeVisible();
	});

	test("interactive: true with both images shows preview without upload buttons", async () => {
		const { getAllByTestId, queryByRole } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, img_b]
		});

		expect(
			queryByRole("button", { name: "Click to upload or drop files" })
		).toBeNull();
		expect(getAllByTestId("imageslider-image").length).toBeGreaterThan(0);
	});

	test("interactive: false with both images shows static preview", async () => {
		const { queryByTestId, getAllByTestId } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [img_a, img_b]
		});

		expect(queryByTestId("file-upload")).toBeNull();
		expect(getAllByTestId("imageslider-image").length).toBeGreaterThan(0);
	});
});

describe("Props: slider_position", () => {
	afterEach(() => cleanup());

	test("slider_position: 50 renders the slider element", async () => {
		const { getByTestId } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b],
			slider_position: 50
		});

		expect(getByTestId("slider")).toBeInTheDocument();
	});

	test.todo(
		"VISUAL: slider_position=0 positions the slider at the left edge — needs Playwright visual regression screenshot comparison"
	);
	test.todo(
		"VISUAL: slider_position=100 positions the slider at the right edge — needs Playwright visual regression screenshot comparison"
	);
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	const preview_props = {
		...default_props,
		interactive: false,
		value: [img_a, img_b] as [FileData, FileData]
	};

	test("buttons: ['download'] shows a download link", async () => {
		const { getByTestId } = await render(ImageSlider, {
			...preview_props,
			buttons: ["download"]
		});

		expect(getByTestId("download-link")).toBeInTheDocument();
	});

	test("buttons: [] hides the download link", async () => {
		const { queryByTestId } = await render(ImageSlider, {
			...preview_props,
			buttons: []
		});

		expect(queryByTestId("download-link")).toBeNull();
	});

	test("buttons: ['fullscreen'] shows the fullscreen button", async () => {
		const { getByLabelText } = await render(ImageSlider, {
			...preview_props,
			buttons: ["fullscreen"]
		});

		expect(getByLabelText("Fullscreen")).toBeVisible();
	});

	test("buttons: [] hides the fullscreen button", async () => {
		const { queryByLabelText } = await render(ImageSlider, {
			...preview_props,
			buttons: []
		});

		expect(queryByLabelText("Fullscreen")).toBeNull();
	});

	test("buttons: ['download', 'fullscreen'] shows both buttons", async () => {
		const { getByTestId, getByLabelText } = await render(ImageSlider, {
			...preview_props,
			buttons: ["download", "fullscreen"]
		});

		expect(getByTestId("download-link")).toBeInTheDocument();
		expect(getByLabelText("Fullscreen")).toBeVisible();
	});

	test("interactive: true with both images shows Remove Image button", async () => {
		const { getByLabelText } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, img_b]
		});

		expect(getByLabelText("Remove Image")).toBeVisible();
	});

	test("interactive: false hides the Remove Image button", async () => {
		const { queryByLabelText } = await render(ImageSlider, {
			...preview_props,
			interactive: false
		});

		expect(queryByLabelText("Remove Image")).toBeNull();
	});

	test("custom button fires custom_button_click with correct id", async () => {
		const { listen, getByLabelText } = await render(ImageSlider, {
			...preview_props,
			buttons: [{ value: "Analyze", id: 42, icon: null }]
		});

		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Analyze"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 42 });
	});

	test("multiple custom buttons each dispatch their own id", async () => {
		const { listen, getByLabelText } = await render(ImageSlider, {
			...preview_props,
			buttons: [
				{ value: "Action A", id: 1, icon: null },
				{ value: "Action B", id: 2, icon: null }
			]
		});

		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Action A"));
		await fireEvent.click(getByLabelText("Action B"));

		expect(custom).toHaveBeenCalledTimes(2);
		expect(custom).toHaveBeenNthCalledWith(1, { id: 1 });
		expect(custom).toHaveBeenNthCalledWith(2, { id: 2 });
	});
});

describe("Props: placeholder", () => {
	afterEach(() => cleanup());

	test("shows placeholder text in the upload areas", async () => {
		// Both upload slots show the same placeholder text; getAllByText handles both
		const { getAllByText } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			placeholder: "Drop comparison images here",
			client: mock_client()
		});

		const placeholders = getAllByText("Drop comparison images here");
		expect(placeholders[0]).toBeVisible();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("no spurious change event on initial mount", async () => {
		const { listen } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b]
		});

		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("fires when set_data changes value", async () => {
		const { listen, set_data } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		const change = listen("change");

		await set_data({ value: [img_a, img_b] });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("fires again when value changes to a different pair", async () => {
		const { listen, set_data } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		const change = listen("change");
		const alt_a = fake_image("alt_a");
		const alt_b = fake_image("alt_b");

		await set_data({ value: [img_a, img_b] });
		await set_data({ value: [alt_a, alt_b] });

		expect(change).toHaveBeenCalledTimes(2);
	});

	test("setting value to [null, null] after having images fires change", async () => {
		const { listen, set_data } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b]
		});

		const change = listen("change");

		await set_data({ value: [null, null] });

		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Events: clear", () => {
	afterEach(() => cleanup());

	test("fires when Remove Image button is clicked", async () => {
		const { listen, getByLabelText } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, img_b]
		});

		const clear = listen("clear");

		await fireEvent.click(getByLabelText("Remove Image"));

		expect(clear).toHaveBeenCalledTimes(1);
	});

	test("value is [null, null] after clicking Remove Image", async () => {
		const { get_data, getByLabelText } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, img_b]
		});

		await fireEvent.click(getByLabelText("Remove Image"));

		const data = await get_data();
		expect(data.value).toEqual([null, null]);
	});
});

describe("Events: upload", () => {
	afterEach(() => cleanup());

	test("fires after a file is uploaded in interactive mode", async () => {
		const { listen } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			client: mock_client(),
			root: "https://example.com"
		});

		const upload = listen("upload");

		await upload_file(TEST_JPG);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
	});

	test("uploading also fires change", async () => {
		const { listen } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			client: mock_client(),
			root: "https://example.com"
		});

		const upload = listen("upload");
		const change = listen("change");

		await upload_file(TEST_JPG);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Events: input", () => {
	afterEach(() => cleanup());

	test("fires when a file is uploaded by the user", async () => {
		const { listen } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [null, null],
			client: mock_client(),
			root: "https://example.com"
		});

		const input = listen("input");

		await upload_file(TEST_JPG);

		await waitFor(() => {
			expect(input).toHaveBeenCalledTimes(1);
		});
	});

	test("does not fire when value changes via set_data (backend output)", async () => {
		const { listen, set_data } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		const input = listen("input");

		await set_data({ value: [img_a, img_b] });

		expect(input).not.toHaveBeenCalled();
	});

	test("fires when Remove Image button is clicked", async () => {
		const { listen, getByLabelText } = await render(ImageSlider, {
			...default_props,
			interactive: true,
			value: [img_a, img_b]
		});

		const input = listen("input");

		await fireEvent.click(getByLabelText("Remove Image"));

		expect(input).toHaveBeenCalledTimes(1);
	});
});

describe("Events: custom_button_click", () => {
	afterEach(() => cleanup());

	test("fires with { id } when a custom button is clicked", async () => {
		const { listen, getByLabelText } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [img_a, img_b],
			buttons: [{ value: "Run", id: 99, icon: null }]
		});

		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Run"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 99 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the initial value", async () => {
		const { get_data } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b]
		});

		const data = await get_data();
		expect(data.value).toEqual([img_a, img_b]);
	});

	test("get_data returns [null, null] when no images are set", async () => {
		const { get_data } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		const data = await get_data();
		expect(data.value).toEqual([null, null]);
	});

	test("set_data then get_data round-trips correctly", async () => {
		const { set_data, get_data } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		await set_data({ value: [img_a, img_b] });

		const data = await get_data();
		expect(data.value).toEqual([img_a, img_b]);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("[null, null] value renders without crash", async () => {
		const { container } = await render(ImageSlider, {
			...default_props,
			value: [null, null]
		});

		expect(container).toBeInTheDocument();
	});

	test("[img, null] partial value renders without crash in static mode", async () => {
		const { container } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [img_a, null]
		});

		expect(container).toBeInTheDocument();
	});

	test("[null, img] partial value renders without crash in static mode", async () => {
		const { container } = await render(ImageSlider, {
			...default_props,
			interactive: false,
			value: [null, img_b]
		});

		expect(container).toBeInTheDocument();
	});

	test("no change event on initial mount when value is set", async () => {
		const { listen } = await render(ImageSlider, {
			...default_props,
			value: [img_a, img_b]
		});

		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});
});

test.todo(
	"VISUAL: slider_color applies the given color to the slider line and handles — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: height prop constrains the component height — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: width prop constrains the component width — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: max_height limits image display height — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: scroll wheel zoom scales both images together — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: mouse drag pans both images when zoomed in — needs Playwright visual regression screenshot comparison"
);
