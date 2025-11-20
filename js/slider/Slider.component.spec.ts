import { test, expect } from "@playwright/experimental-ct-svelte";
import type { Page, Locator } from "@playwright/test";
import Slider from "./Index.svelte";
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

test("Slider Default Value And Label rendered", async ({ mount }) => {
	const component = await mount(Slider, {
		props: {
			props: {
				value: 3,
				minimum: 0,
				maximum: 10,
				step: 1,
				__GRADIO_BROWSER_TEST__: true
			},
			shared_props: {
				label: "My Slider",
				show_label: true,
				interactive: true,
				loading_status: loading_status
			}
		}
	});
	await expect(component.getByTestId("block-info")).toContainText("My Slider");

	expect(
		component.getByRole("spinbutton", {
			name: "My Slider"
		})
	).toHaveValue("3");
});

test("Slider respects show_label", async ({ mount, page }) => {
	const component = await mount(Slider, {
		props: {
			props: {
				value: 3,
				minimum: 0,
				maximum: 10,
				step: 1,
				__GRADIO_BROWSER_TEST__: true
			},
			shared_props: {
				label: "My Slider",
				show_label: false,
				interactive: true,
				loading_status: loading_status
			}
		}
	});
	await expect(component.getByTestId("block-title")).toBeHidden();
});

test("Slider respects show_reset_button", async ({ mount, page }) => {
	const component = await mount(Slider, {
		props: {
			props: {
				value: 3,
				minimum: 0,
				maximum: 10,
				step: 1,
				__GRADIO_BROWSER_TEST__: true,
				show_reset_button: true
			},
			shared_props: {
				label: "My Slider",
				show_label: false,
				interactive: true,
				loading_status: loading_status
			}
		}
	});
	await expect(component.getByTestId("reset-button")).toBeVisible();
});

test("Slider Maximum/Minimum values", async ({ mount, page }) => {
	const component = await mount(Slider, {
		props: {
			props: {
				value: 3,
				minimum: 0,
				maximum: 10,
				step: 1,
				__GRADIO_BROWSER_TEST__: true
			},
			shared_props: {
				label: "My Slider",
				show_label: false,
				interactive: true,
				loading_status: loading_status
			}
		}
	});

	const sliderNumberInput = component.getByRole("spinbutton", {
		name: "My Slider"
	});

	const sliderRangeInput = component.getByRole("slider", {
		name: "range slider for My Slider"
	});

	await expect(sliderNumberInput).toHaveValue("3");

	// test number input
	await sliderNumberInput.fill("5");
	await sliderNumberInput.press("Enter");
	await expect(sliderNumberInput).toHaveValue("5");

	// test slider thumb movement
	await sliderRangeInput.focus();
	await sliderRangeInput.evaluate((el: HTMLInputElement) => {
		el.value = "7";
		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));
	});
	await expect(sliderNumberInput).toHaveValue("7");

	// test maximum value
	await sliderRangeInput.evaluate((el: HTMLInputElement) => {
		el.value = "10";
		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));
	});
	await expect(sliderNumberInput).toHaveValue("10");
});

test.fixme("Slider Change event", async ({ mount, page }) => {
	const events = {
		change: 0,
		release: 0
	};

	function event(name: "change" | "release") {
		events[name] += 1;
	}

	// Don't know how to mock dispatch events yet
	const component = await mount(Slider, {
		props: {
			props: {
				value: 3,
				minimum: 0,
				maximum: 10,
				step: 1,
				__GRADIO_BROWSER_TEST__: true
			},
			shared_props: {
				label: "My Slider",
				show_label: false,
				interactive: true,
				loading_status: loading_status
			}
		}
	});

	const sliderNumberInput = component.getByRole("spinbutton", {
		name: "My Slider"
	});

	const sliderRangeInput = component.getByRole("slider", {
		name: "range slider for My Slider"
	});

	await expect(sliderNumberInput).toHaveValue("3");

	// change value using slider thumb
	await sliderRangeInput.evaluate((el: HTMLInputElement) => {
		el.value = "7";
		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));
	});

	await expect(sliderNumberInput).toHaveValue("7");

	await sliderRangeInput.evaluate((el: HTMLInputElement) => {
		el.dispatchEvent(new Event("pointerup", { bubbles: true }));
	});

	// More than one change event and one release event.
	await expect(events.change).toBeGreaterThanOrEqual(1);
	await expect(events.release).toBeGreaterThanOrEqual(1);
});
