import { test, expect } from "@playwright/experimental-ct-svelte";
import Slider from "./Slider.svelte";

import type { LoadingStatus } from "../StatusTracker/types";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

test("should work", async ({ mount }) => {
	const component = await mount(Slider, {
		props: {
			value: 3,
			minimum: 0,
			maximum: 10,
			label: "My Slider",
			show_label: true,
			step: 1,
			mode: "dynamic",
			loading_status: loading_status
		}
	});
	await expect(component).toContainText("My Slider");
});
