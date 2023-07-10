import { test, describe, expect, afterEach, vi, assert } from "vitest";
import { cleanup, render } from "@gradio/tootils";
import { spy } from "tinyspy";

import File from "./File.svelte";
import type { LoadingStatus } from "../StatusTracker/types";
import { upload_files } from "@gradio/client";

const loading_status = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0
};

describe("File", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	test("gr.File uploads with blob", async () => {
		vi.mock("@gradio/client", async () => {
			return {
				upload_files: vi.fn((f) => new Promise((res) => res({})))
			};
		});

		const api = await import("@gradio/client");

		await render(File, {
			loading_status,
			label: "file",
			// @ts-ignore
			value: { name: "freddy.json", data: "{'name': 'freddy'}", blob: vi.fn() },
			show_label: true,
			mode: "dynamic",
			root: "http://localhost:7860",
			file_count: "1",
			root_url: null
		});

		expect(api.upload_files).toHaveBeenCalled();
	});

	test("gr.File does not upload without blob", async () => {
		const mockUpload = vi.fn(upload_files);

		const { component } = await render(File, {
			loading_status,
			label: "file",
			value: { name: "freddy.json", data: "{'name': 'freddy'}" },
			show_label: true,
			mode: "dynamic",
			root: "http://localhost:7860",
			file_count: "1",
			root_url: null
		});

		expect(mockUpload).not.toHaveBeenCalled();

		const mock = spy();
		component.$on("change", mock);

		component.value = {
			name: "freddy_2.json",
			data: "{'name': 'freddy'}",
			is_file: true
		};

		assert.equal(mock.callCount, 1);
	});
});
