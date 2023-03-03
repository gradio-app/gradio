import { test, describe, assert, expect, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";

import File from "./File.svelte";
import type { LoadingStatus } from "../StatusTracker/types";
import { upload_files } from "../../api";

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
		vi.mock("../../api", async () => {
			return {
				upload_files: vi.fn((f) => new Promise((res) => res({})))
			};
		});

		const api = await import("../../api");

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

	// test("renders additional message as they are passed", async () => {
	// 	const { component, getAllByTestId } = render(Chatbot, {
	// 		loading_status,
	// 		label: "hello",
	// 		value: [["user message one", "bot message one"]]
	// 	});

	// 	const bot = getAllByTestId("user");
	// 	const user = getAllByTestId("bot");

	// 	assert.equal(user.length, 1);
	// 	assert.equal(bot.length, 1);

	// 	await component.$set({
	// 		value: [
	// 			["user message one", "bot message one"],
	// 			["user message two", "bot message two"]
	// 		]
	// 	});

	// 	const user_2 = getAllByTestId("user");
	// 	const bot_2 = getAllByTestId("bot");

	// 	assert.equal(user_2.length, 2);
	// 	assert.equal(bot_2.length, 2);

	// 	assert.equal(get_text(user_2[1]), "user message two");
	// 	assert.equal(get_text(bot_2[1]), "bot message two");
	// });
});
