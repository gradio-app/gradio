import { describe, test, expect, afterEach, vi } from "vitest";
import {
	cleanup,
	render,
	fireEvent,
	waitFor,
	upload_file,
	mock_client,
	TEST_TXT,
	TEST_PDF,
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import UploadButton from "./Index.svelte";

const default_props = {
	label: "Upload files",
	show_label: true,
	value: null,
	file_count: "single",
	file_types: [] as string[],
	root: "https://example.com",
	interactive: true,
	client: mock_client(),
	variant: "secondary" as const,
	size: "lg" as const,
	icon: null,
};

run_shared_prop_tests({
	component: UploadButton,
	name: "UploadButton",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false,
	visible_false_hides: true,
	has_block_wrapper: false,
});

describe("UploadButton", () => {
	afterEach(() => cleanup());

	test("renders the label as the button's accessible name", async () => {
		const { getByRole } = await render(UploadButton, {
			...default_props,
		});

		expect(getByRole("button", { name: default_props.label })).toBeVisible();
	});

	test("clicking the button dispatches a click event", async () => {
		const { getByRole, listen } = await render(UploadButton, {
			...default_props,
		});

		const click = listen("click");
		await fireEvent.click(getByRole("button", { name: default_props.label }));

		expect(click).toHaveBeenCalledTimes(1);
	});
});

describe("Props: file_types", () => {
	afterEach(() => cleanup());

	test("maps file type filters to the native input accept attribute", async () => {
		const { container } = await render(UploadButton, {
			...default_props,
			file_types: [".txt", "image"],
		});

		const input = container.querySelector("input[type='file']");
		expect(input).toHaveAttribute("accept", ".txt, image/*");
	});
});

describe("Events: upload", () => {
	afterEach(() => cleanup());

	test("uploading a file fires upload and change", async () => {
		const { listen } = await render(UploadButton, {
			...default_props,
		});

		const upload = listen("upload");
		const change = listen("change");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("single file mode keeps the native input in single-select mode", async () => {
		const { container } = await render(UploadButton, {
			...default_props,
		});

		const input = container.querySelector("input[type='file']");
		expect(input).not.toHaveAttribute("multiple");
	});

	test("multiple file mode uploads every selected file", async () => {
		const upload = vi.fn(async (file_data: any[]) => file_data);
		await render(UploadButton, {
			...default_props,
			file_count: "multiple",
			client: {
				upload,
				stream: async () => ({ onmessage: null, close: () => {} }),
			},
		});

		await upload_file([TEST_TXT, TEST_PDF]);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(upload.mock.calls[0][0]).toHaveLength(2);
	});

	test("upload failure dispatches an error event with the message", async () => {
		const failing_upload = vi
			.fn()
			.mockRejectedValue(new Error("File too large"));
		const { listen } = await render(UploadButton, {
			...default_props,
			client: {
				upload: failing_upload,
				stream: async () => ({ onmessage: null, close: () => {} }),
			},
		});

		const error = listen("error");

		await upload_file(TEST_TXT);

		await waitFor(() => {
			expect(failing_upload).toHaveBeenCalledTimes(1);
		});
		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith("File too large");
	});
});
