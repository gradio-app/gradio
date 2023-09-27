import { test, expect } from "@playwright/experimental-ct-svelte";
import type { Page, Locator } from "@playwright/test";
import Slider from "./interactive";
import { spy } from "tinyspy";

import type { LoadingStatus } from "@gradio/statustracker";

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

//taken from: https://github.com/microsoft/playwright/issues/20032
async function changeSlider(
	page: Page,
	thumb: Locator,
	slider: Locator,
	targetPercentage: number
) {
	const thumbBoundingBox = await thumb.boundingBox();
	const sliderBoundingBox = await slider.boundingBox();

	if (thumbBoundingBox === null || sliderBoundingBox === null) {
		return; // NOTE it's probably better to throw an error here
	}

	// Start from the middle of the slider's thumb
	const startPoint = {
		x: thumbBoundingBox.x + thumbBoundingBox.width / 2,
		y: thumbBoundingBox.y + thumbBoundingBox.height / 2
	};

	// Slide it to some endpoint determined by the target percentage
	const endPoint = {
		x: sliderBoundingBox.x + sliderBoundingBox.width * targetPercentage,
		y: thumbBoundingBox.y + thumbBoundingBox.height / 2
	};

	await page.mouse.move(startPoint.x, startPoint.y);
	await page.mouse.down();
	await page.mouse.move(endPoint.x, endPoint.y);
	await page.mouse.up();
}

test("Slider Default Value And Label rendered", async ({ mount }) => {
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

	expect(
		component.getByRole("spinbutton", {
			name: "My Slider"
		})
	).toHaveValue("3");
});

test("Slider respects show_label", async ({ mount, page }) => {
	const component = await mount(Slider, {
		props: {
			value: 3,
			minimum: 0,
			maximum: 10,
			label: "My Slider",
			show_label: false,
			step: 1,
			mode: "dynamic",
			loading_status: loading_status,
			gradio: {
				dispatch() {}
			}
		}
	});
	await expect(component.getByTestId("block-title")).toBeHidden();
});

test("Slider Maximum/Minimum values", async ({ mount, page }) => {
	const component = await mount(Slider, {
		props: {
			value: 3,
			minimum: 0,
			maximum: 10,
			label: "My Slider",
			show_label: true,
			step: 1,
			mode: "dynamic",
			loading_status: loading_status,
			gradio: {
				dispatch() {}
			}
		}
	});

	const sliderNumberInput = component.getByRole("spinbutton", {
		name: "My Slider"
	});

	await expect(sliderNumberInput).toHaveValue("3");

	await sliderNumberInput.press("ArrowUp");

	await expect(sliderNumberInput).toHaveValue("4");

	const sliderRangeInput = component.getByRole("slider");

	await sliderRangeInput.focus();

	sliderRangeInput.press("ArrowRight");

	await expect(sliderNumberInput).toHaveValue("5");

	changeSlider(page, sliderRangeInput, sliderRangeInput, 2);

	await expect(sliderNumberInput).toHaveValue("10");
});

test("Slider Change event", async ({ mount, page }) => {
	const events = {
		change: 0,
		release: 0
	};

	function event(name: "change" | "release") {
		events[name] += 1;
	}

	const component = await mount(Slider, {
		props: {
			value: 3,
			minimum: 0,
			maximum: 10,
			label: "My Slider",
			show_label: true,
			step: 1,
			mode: "dynamic",
			loading_status: loading_status,
			gradio: {
				dispatch: event
			}
		}
	});

	const sliderNumberInput = component.getByRole("spinbutton", {
		name: "My Slider"
	});

	const sliderRangeInput = component.getByRole("slider");

	await expect(sliderNumberInput).toHaveValue("3");

	await changeSlider(page, sliderRangeInput, sliderRangeInput, 0.7);

	await expect(sliderNumberInput).toHaveValue("7");

	// More than one change event and one release event.
	await expect(events.change).toBeGreaterThanOrEqual(1);
	await expect(events.release).toBeGreaterThanOrEqual(1);
});
