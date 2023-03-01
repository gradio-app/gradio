import { test, expect, Page, Locator } from "@playwright/test";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

// function mock_demo(page: Page, demo: string) {
// 	return page.route("**/config", (route) => {
// 		return route.fulfill({
// 			headers: {
// 				"Access-Control-Allow-Origin": "*"
// 			},
// 			path: `../../../demo/${demo}/config.json`
// 		});
// 	});
// }

// function mock_api(page: Page) {
// 	return page.route("**/run/predict/", (route) => {
// 		console.log(route.request().postData()!);
// 		return route.fulfill({
// 			headers: {
// 				"Access-Control-Allow-Origin": "*"
// 			},
// 			body: route.request().postData()!
// 		});
// 	});
// }

// let demo: ChildProcessWithoutNullStreams;

// test.beforeAll(async () => {
// 	demo = spawn("python", ["../../../demo/slider_release/run.py"]);
// 	demo.stderr.pipe(process.stderr);
// 	demo.stdout.pipe(process.stdout);
// });

// test.afterAll(async () => {
// 	//demo.kill("SIGINT");
// })

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
	//await mock_demo(page, "slider_release");
	await page.goto("http://127.0.0.1:7888/");
	//await mock_api(page);

	const slider = page.getByLabel("Slider");

	const responsePromise = page.waitForResponse(
		"http://127.0.0.1:7888/run/predict/"
	);
	await changeSlider(page, slider, slider, 0.7);
	const response = await responsePromise;
	const responseData = await response.json();

	expect(responseData.data[0]).toBeGreaterThan(69.5);
	expect(responseData.data[0]).toBeLessThan(71.0);
	//const eventTracker = page.getByLabel("Number of events fired");
	expect(responseData.data[2]).toEqual(1);
});
