import { afterEach, describe, expect, test } from "vitest";
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
	show_progress: "full",
};

const baseProps = {
	show_label: true,
	max_lines: 1,
	loading_status,
	lines: 1,
	label: "Markdown",
	interactive: false,
};

describe("Markdown", () => {
	afterEach(cleanup);

	test("renders valid URLs", async () => {
		const { getByText } = await render(Markdown, {
			...baseProps,
			value: "Visit [Gradio](https://www.gradio.app/) for more information.",
		});

		const link = getByText("Gradio") as HTMLAnchorElement;
		expect(link.href).toBe("https://www.gradio.app/");
	});

	test("renders invalid URLs without stripping the href", async () => {
		const { getByText } = await render(Markdown, {
			...baseProps,
			value: "Visit [Invalid URL](https://) for more information.",
		});

		const link = getByText("Invalid URL") as HTMLAnchorElement;
		expect(link.href).toBe("https://");
	});

	test("does not apply the pending class when show_progress is hidden", async () => {
		const { container } = await render(Markdown, {
			...baseProps,
			show_label: false,
			loading_status: {
				...loading_status,
				status: "pending",
				show_progress: "hidden",
			} as LoadingStatus,
			value: "Content",
		});

		expect(container.querySelector("div.pending")).toBeNull();
	});
});
