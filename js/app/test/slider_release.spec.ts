import { Page, Locator } from "@playwright/test";
import { test, expect } from "@gradio/tootils";

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
	const slider = page.getByLabel("Slider");

	await changeSlider(page, slider, slider, 0.7);

	const value = page.getByLabel("On release");
	const events = page.getByLabel("Number of events fired");

	const val = await slider.inputValue();
	expect(parseInt(val)).toBeCloseTo(70);
	expect(parseInt(await value.inputValue())).toBeCloseTo(70);
	expect(events).toHaveValue("1");
});
