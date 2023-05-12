import { test, expect, Page, Locator } from "@playwright/test";
import { mock_theme, wait_for_page, mock_api, mock_demo } from "./utils";

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

test("slider release", async ({ page }) => {
	await mock_demo(page, "slider_release");
	await mock_api(page, [[70, null, 1]]);
	await mock_theme(page);
	await wait_for_page(page);
	const slider = page.getByLabel("Slider");

	await changeSlider(page, slider, slider, 0.7);

	const value = page.getByLabel("On release");
	const events = page.getByLabel("Number of events fired");

	const val = await slider.inputValue();
	expect(parseInt(val)).toBeCloseTo(70);
	expect(value).toHaveValue("70");
	expect(events).toHaveValue("1");
});
