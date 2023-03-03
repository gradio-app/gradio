import { test, expect, Page, Locator } from "@playwright/test";

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
	await page.goto("http://127.0.0.1:7888/");

	const slider = page.getByLabel("Slider");

	const responsePromise = page.waitForResponse(
		"http://127.0.0.1:7888/run/predict/"
	);
	await changeSlider(page, slider, slider, 0.7);
	const response = await responsePromise;
	const responseData = await response.json();

	expect(responseData.data[0]).toBeGreaterThan(69.5);
	expect(responseData.data[0]).toBeLessThan(71.0);
	expect(responseData.data[2]).toEqual(1);
});
