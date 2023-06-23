import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";

import Gallery from "./Gallery.svelte";
import type { LoadingStatus } from "../StatusTracker/types";

const loading_status = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0
};

describe("Gallery", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	test("preview shows detailed image by default", async () => {
		const { getAllByTestId, getByTestId } = render(Gallery, {
			loading_status,
			label: "gallery",
			// @ts-ignore
			value: [
				[
					{
						name: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
						data: null,
						is_file: true
					},
					"label 0"
				],
				[
					{
						name: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW4lMjBmYWNlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
						data: null,
						is_file: true
					},
					"label 1"
				]
			],
			show_label: true,
			mode: "dynamic",
			root: "http://localhost:7860",
			root_url: null,
			preview: true
		});

		const details = getAllByTestId("detailed-image");
		const container = getByTestId("container_el");
		container.scrollTo = () => {};

		assert.equal(details.length, 1);
	});

	test("detailed view does not show larger image", async () => {
		const { queryAllByTestId, getByTestId } = render(Gallery, {
			loading_status,
			label: "gallery",
			// @ts-ignore
			value: [
				[
					{
						name: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
						data: null,
						is_file: true
					},
					"label 0"
				],
				[
					{
						name: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aHVtYW4lMjBmYWNlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
						data: null,
						is_file: true
					},
					"label 1"
				],
				[
					{
						name: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80",
						data: null,
						is_file: true
					},
					"label 2"
				]
			],
			show_label: true,
			mode: "dynamic",
			root: "http://localhost:7860",
			root_url: null,
			preview: true,
			allow_preview: false
		});

		const details = queryAllByTestId("detailed-image");

		assert.equal(details.length, 0);
	});
});
