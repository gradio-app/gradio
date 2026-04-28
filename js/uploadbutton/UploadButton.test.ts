import { test, describe, afterEach, expect, vi } from "vitest";
import {
	cleanup,
	render,
	waitFor,
	upload_file,
	mock_client,
	TEST_TXT,
	TEST_JPG
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import UploadButton from "./Index.svelte";

const base_props = {
	label: "Upload",
	show_label: true,
	interactive: true,
	value: null as any,
	file_count: "single" as "single" | "multiple" | "directory",
	file_types: [] as string[],
	size: "lg" as "sm" | "md" | "lg",
	icon: null as any,
	variant: "secondary" as "primary" | "secondary" | "stop"
};

const upload_props = {
	...base_props,
	root: "https://example.com",
	client: mock_client()
};

run_shared_prop_tests({
	component: UploadButton,
	name: "UploadButton",
	base_props,
	has_label: false,
	has_validation_error: false,
	has_block_wrapper: false,
	visible_false_hides: true
});

describe("UploadButton", () => {
	afterEach(() => cleanup());

	test("renders a button with the label text", async () => {
		const { getByRole } = await render(UploadButton, {
			...base_props,
			label: "Upload a File"
		});

		expect(getByRole("button", { name: "Upload a File" })).toBeVisible();
	});

	test("button is enabled when interactive is true", async () => {
		const { getByRole } = await render(UploadButton, {
			...base_props,
			interactive: true
		});

		expect(getByRole("button", { name: "Upload" })).toBeEnabled();
	});

	test("button is disabled when interactive is false", async () => {
		const { getByRole } = await render(UploadButton, {
			...base_props,
			interactive: false
		});

		expect(getByRole("button", { name: "Upload" })).toBeDisabled();
	});
});

describe("Props: file_count", () => {
	afterEach(() => cleanup());

	test("file_count='single' does not set multiple attribute on input", async () => {
		const { getByTestId } = await render(UploadButton, {
			...base_props,
			file_count: "single"
		});

		const input = getByTestId("Upload-upload-button");
		expect(input).not.toHaveAttribute("multiple");
	});

	test("file_count='multiple' sets multiple attribute on input", async () => {
		const { getByTestId } = await render(UploadButton, {
			...base_props,
			file_count: "multiple"
		});

		const input = getByTestId("Upload-upload-button");
		expect(input).toHaveAttribute("multiple");
	});

	test("file_count='directory' sets webkitdirectory attribute on input", async () => {
		const { getByTestId } = await render(UploadButton, {
			...base_props,
			file_count: "directory"
		});

		const input = getByTestId("Upload-upload-button");
		expect(input).toHaveAttribute("webkitdirectory");
	});
});

describe("Props: file_types", () => {
	afterEach(() => cleanup());

	test("file_types maps category names to wildcard MIME types", async () => {
		const { getByTestId } = await render(UploadButton, {
			...base_props,
			file_types: ["image", "audio"]
		});

		const input = getByTestId("Upload-upload-button");
		expect(input).toHaveAttribute("accept", "image/*, audio/*");
	});

	test("file_types passes dot-prefixed extensions through unchanged", async () => {
		const { getByTestId } = await render(UploadButton, {
			...base_props,
			file_types: [".csv", ".json"]
		});

		const input = getByTestId("Upload-upload-button");
		expect(input).toHaveAttribute("accept", ".csv, .json");
	});

	test("empty file_types array results in empty accept attribute", async () => {
		const { getByTestId } = await render(UploadButton, {
			...base_props,
			file_types: []
		});

		const input = getByTestId("Upload-upload-button");
		expect(input).toHaveAttribute("accept", "");
	});
});

describe("Props: icon", () => {
	afterEach(() => cleanup());

	test("icon renders an image inside the button when provided", async () => {
		const { getByRole } = await render(UploadButton, {
			...base_props,
			icon: {
				path: "icon.png",
				url: "https://example.com/icon.png",
				orig_name: "icon.png",
				size: 100,
				mime_type: "image/png"
			}
		});

		expect(getByRole("img")).toBeInTheDocument();
	});

	test("no icon rendered when icon is null", async () => {
		const { queryByRole } = await render(UploadButton, {
			...base_props,
			icon: null
		});

		expect(queryByRole("img")).not.toBeInTheDocument();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("no spurious change event on mount", async () => {
		const { listen } = await render(UploadButton, {
			...base_props,
			value: null
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("click event fires when button is clicked", async () => {
		const { getByRole, listen } = await render(UploadButton, {
			...upload_props
		});

		const click = listen("click");
		await event.click(getByRole("button", { name: "Upload" }));

		expect(click).toHaveBeenCalledTimes(1);
	});

	test("upload and change events fire after file upload", async () => {
		const { listen } = await render(UploadButton, {
			...upload_props
		});

		const upload = listen("upload");
		const change = listen("change");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("upload failure dispatches error event with the message", async () => {
		const failing_upload = vi
			.fn()
			.mockRejectedValue(new Error("File too large"));
		const { listen } = await render(UploadButton, {
			...upload_props,
			client: {
				upload: failing_upload,
				stream: async () => ({ onmessage: null, close: () => {} })
			}
		});

		const error = listen("error");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(failing_upload).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith("File too large");
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns null initially", async () => {
		const { get_data } = await render(UploadButton, {
			...base_props,
			value: null
		});

		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("get_data returns initial value when mounted with one", async () => {
		const { get_data } = await render(UploadButton, {
			...base_props,
			value: TEST_TXT
		});

		const data = await get_data();
		expect(data.value).toEqual(TEST_TXT);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("no mount-time events with initial value set", async () => {
		const { listen } = await render(UploadButton, {
			...base_props,
			value: TEST_TXT
		});

		const change = listen("change", { retrospective: true });
		const upload = listen("upload", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
		expect(upload).not.toHaveBeenCalled();
	});
});

test.todo(
	"VISUAL: variant='primary' renders the button with primary styling — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: variant='secondary' renders the button with secondary styling — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: variant='stop' renders the button with stop/red styling — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: size='sm' renders a small button — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: size='md' renders a medium button — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: size='lg' renders a large button — needs Playwright visual regression screenshot comparison"
);
