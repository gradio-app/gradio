import { test, describe, expect, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";

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

	test("Uploads with blob", async () => {
		vi.mock("@gradio/client", async () => {
			return {
				upload_files: vi.fn((f) => new Promise((res) => res({})))
			};
		});

		const api = await import("@gradio/client");

		render(File, {
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

	test("Does not upload without blob", () => {
		const spy = vi.fn(upload_files);

		render(File, {
			loading_status,
			label: "file",
			value: { name: "freddy.json", data: "{'name': 'freddy'}" },
			show_label: true,
			mode: "dynamic",
			root: "http://localhost:7860",
			file_count: "1",
			root_url: null
		});

		expect(spy).not.toHaveBeenCalled();
	});
});
