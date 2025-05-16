import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Markdown from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

describe("Markdown", () => {
	afterEach(() => cleanup());

	test("renders valid URL", async () => {
		const { getByText } = await render(Markdown, {
			show_label: true,
			max_lines: 1,
			loading_status,
			lines: 1,
			value: "Visit [Gradio](https://www.gradio.app/) for more information.",
			label: "Markdown",
			interactive: false
		});

		const link: HTMLAnchorElement = getByText("Gradio") as HTMLAnchorElement;
		assert.equal(link.href, "https://www.gradio.app/");
	});

	test("renders invalid URL", async () => {
		const { getByText } = await render(Markdown, {
			show_label: true,
			max_lines: 1,
			loading_status,
			lines: 1,
			value: "Visit [Invalid URL](https://) for more information.",
			label: "Markdown",
			interactive: false
		});

		const link: HTMLAnchorElement = getByText(
			"Invalid URL"
		) as HTMLAnchorElement;
		assert.equal(link.href, "https://");
	});
});
