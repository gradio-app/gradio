import "@testing-library/jest-dom";

import { test, describe, afterEach } from "vitest";
import { cleanup, render } from "@gradio/tootils";

import StaticVideo from "./StaticVideo.svelte";

describe("StaticVideo", () => {
	afterEach(() => cleanup());

	const data = {
		data: "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/demo/video_component/files/a.mp4",
		name: "a.mp4"
	};

	test("renders video and download button", () => {
		const results = render(StaticVideo, {
			label: "video",
			show_label: true,
			value: data
		});

		//expect(results.getAllByLabelText("video")).not.toThrow();

		const downloadButton = results.getAllByTestId("download-div")[0];
		expect(
			downloadButton.getElementsByTagName("a")[0].getAttribute("href")
		).toBe(data.data);
		expect(
			downloadButton.getElementsByTagName("button").length
		).toBeGreaterThan(0);

		expect(downloadButton.getElementsByTagName("button")[0]).toBeVisible();
	});
});
