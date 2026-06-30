import { describe, test, expect, vi, afterEach } from "vitest";
import {
	render,
	download_file,
	upload_file,
	drop_file,
	cleanup,
	mock_client,
	TEST_TXT,
	TEST_JPG,
	TEST_MP4,
	TEST_PDF
} from "@self/tootils/render";
import File from "./Index.svelte";

const default_props = {
	interactive: true,
	label: "Test File",
	show_label: true,
	value: null,
	file_count: "single",
	file_types: null,
	root: "http://localhost:7860",
	client: mock_client()
};

describe("File", () => {
	afterEach(() => cleanup());

	test("download link triggers a real file download with correct content", async () => {
		await render(File, {
			...default_props,
			value: [TEST_TXT]
		});

		const { suggested_filename, content } = await download_file("a[download]");

		expect(suggested_filename).toBe("alphabet.txt");
		expect(content).toBe("abcdefghijklmnopqrstuvwxyz");
	});

	test("upload_file sets a file on the file input", async () => {
		const { listen } = await render(File, default_props);

		const upload = listen("upload");
		await upload_file(TEST_TXT);

		await vi.waitFor(() => expect(upload).toHaveBeenCalled());
	});

	test("drop_file simulates drag-and-drop onto the upload area", async () => {
		const { listen } = await render(File, default_props);

		const upload = listen("upload");
		await drop_file(TEST_TXT, "[aria-label='Click to upload or drop files']");

		await vi.waitFor(() => expect(upload).toHaveBeenCalled());
	});

	test("file_types accepts image category uploads", async () => {
		const { listen } = await render(File, {
			...default_props,
			file_types: ["image", "video"]
		});

		const upload = listen("upload");
		await upload_file(TEST_JPG);

		await vi.waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
	});

	test("file_types accepts video category uploads", async () => {
		const { listen } = await render(File, {
			...default_props,
			file_types: ["image", "video"]
		});

		const upload = listen("upload");
		await upload_file(TEST_MP4);

		await vi.waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
	});

	test("file_types accepts dot-prefixed extension uploads", async () => {
		const { listen } = await render(File, {
			...default_props,
			file_types: [".pdf"]
		});

		const upload = listen("upload");
		await upload_file(TEST_PDF);

		await vi.waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
	});
});
