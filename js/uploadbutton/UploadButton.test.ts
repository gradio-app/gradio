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

	test("file_count='single' returns a single FileData, not an array", async () => {
		const { get_data } = await render(UploadButton, {
			...upload_props,
			file_count: "single"
		});

		await upload_file(TEST_TXT);

		await waitFor(async () => {
			const data = await get_data();
			expect(data.value).not.toBeNull();
		});
		const data = await get_data();
		expect(Array.isArray(data.value)).toBe(false);
		expect(data.value).toHaveProperty("orig_name");
	});

	test("file_count='multiple' returns an array of FileData", async () => {
		const { get_data } = await render(UploadButton, {
			...upload_props,
			file_count: "multiple"
		});

		await upload_file([TEST_TXT, TEST_JPG]);

		await waitFor(async () => {
			const data = await get_data();
			expect(data.value).not.toBeNull();
		});
		const data = await get_data();
		expect(Array.isArray(data.value)).toBe(true);
		expect(data.value).toHaveLength(2);
	});

	// Attribute assertion: directory upload can't be driven programmatically —
	// webkitdirectory is the browser-native mechanism and there's no behavioural
	// equivalent we can simulate in a unit test.
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

	test("rejects files that do not match file_types and dispatches error", async () => {
		const { listen } = await render(UploadButton, {
			...upload_props,
			file_types: ["image"]
		});

		const upload = listen("upload");
		const error = listen("error");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith(
			expect.stringContaining("Invalid file type")
		);
		expect(upload).not.toHaveBeenCalled();
	});

	test("accepts files matching a wildcard MIME category", async () => {
		const { listen } = await render(UploadButton, {
			...upload_props,
			file_types: ["image"]
		});

		const upload = listen("upload");

		await upload_file(TEST_JPG);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
	});

	test("accepts files matching a dot-prefixed extension", async () => {
		const { listen } = await render(UploadButton, {
			...upload_props,
			file_types: [".txt"]
		});

		const upload = listen("upload");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
	});

	test("multiple file_types each allow their matching files", async () => {
		const { listen } = await render(UploadButton, {
			...upload_props,
			file_types: ["image", ".txt"]
		});

		const upload = listen("upload");

		await upload_file(TEST_JPG);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(2);
		});
	});

	test("rejects file not matching any of multiple file_types", async () => {
		const { listen } = await render(UploadButton, {
			...upload_props,
			file_types: ["image", "audio"]
		});

		const upload = listen("upload");
		const error = listen("error");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(upload).not.toHaveBeenCalled();
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

		expect(getByRole("img")).toHaveAttribute(
			"src",
			"https://example.com/icon.png"
		);
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
			client: { ...mock_client(), upload: failing_upload }
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

	test("set_data updates the value reported by get_data", async () => {
		const { set_data, get_data } = await render(UploadButton, base_props);
		await set_data({ value: TEST_TXT });
		await waitFor(async () =>
			expect((await get_data()).value).toEqual(TEST_TXT)
		);
	});

	test("upload interaction is reflected in get_data", async () => {
		const { get_data } = await render(UploadButton, upload_props);
		await upload_file(TEST_TXT);
		await waitFor(async () => expect((await get_data()).value).not.toBeNull());
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("max_file_size is forwarded to client.upload", async () => {
		const upload_spy = vi.fn(async (file_data) => file_data);
		await render(UploadButton, {
			...upload_props,
			max_file_size: 100,
			client: { ...mock_client(), upload: upload_spy }
		});
		await upload_file(TEST_TXT);
		await waitFor(() => expect(upload_spy).toHaveBeenCalled());
		expect(upload_spy).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			undefined,
			100
		);
	});

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
