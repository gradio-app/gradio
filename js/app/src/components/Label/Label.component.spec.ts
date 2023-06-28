import { test, expect } from "@playwright/experimental-ct-svelte";
import type { Page, Locator } from "@playwright/test";
import Label from "./Label.svelte";
import { spy } from "tinyspy";

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

test("Label Default Value And Label rendered", async ({ mount, page }) => {
	const component = await mount(Label, {
		props: {
			value: {
				label: "Good",
				confidences: [
					{ label: "Good", confidence: 0.9 },
					{ label: "Bad", confidence: 0.1 }
				]
			},
			label: "My Label",
			show_label: true,
			loading_status: loading_status
		}
	});
	await expect(component).toContainText("My Label");
	await expect(page.getByTestId("label-output-value")).toContainText("Good");
	await expect(page.getByTestId("Good-confidence-set")).toContainText("90");
});

// test("Slider Change event", async ({ mount, page }) => {
//     let change = spy();
//     let release = spy();
//     const component = await mount(Slider, {
//         props: {
//             value: 3,
//             minimum: 0,
//             maximum: 10,
//             label: "My Slider",
//             show_label: true,
//             step: 1,
//             mode: "dynamic",
//             loading_status: loading_status
//         },
//         on: {
//             change: change,
//             release: release
//         }
//     });

//     const slider = page.getByLabel("Slider");

//     await changeSlider(page, slider, slider, 0.7);
//     await expect(component.getByLabel("My Slider")).toHaveValue("7");

//     // More than one change event and one release event.
//     await expect(change.callCount).toBeGreaterThan(1);
//     await expect(release.callCount).toEqual(1);
// });
