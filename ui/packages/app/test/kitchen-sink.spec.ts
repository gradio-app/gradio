import { test, expect, Page } from "@playwright/test";

function mock_demo(page: Page, demo: string) {
	return page.route("**/config", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `../../../demo/kitchen_sink/config.json`
		});
	});
}

function mock_api(page: Page, body: Array<unknown>) {
	return page.route("**/api/predict/", (route) => {
		const id = JSON.parse(route.request().postData()!).fn_index;
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			body: JSON.stringify({
				data: body[id]
			})
		});
	});
}

test("renders the correct elements", async ({ page }) => {
	await mock_demo(page, "kitchen_sink");
	await page.goto("http://localhost:3000");
	// await page.

	// await page.locator('text=the quick brown fox').first().click();
});

test("can run an api request and display the data", async ({ page }) => {
	await mock_demo(page, "kitchen_sink");
	// await mock_api(page, [
	// 	[
	// 		{
	// 			Covid: 0.75,
	// 			"Lung Cancer": 0.25
	// 		}
	// 	],
	// 	[
	// 		{
	// 			Covid: 0.75,
	// 			"Lung Cancer": 0.25
	// 		}
	// 	]
	// ]);

	// await page.goto("http://localhost:3000");

	// await page.check("label:has-text('Covid')");
	// await page.check("label:has-text('Lung Cancer')");

	// const run_button = await page.locator("button", { hasText: /Run/ });

	// await Promise.all([
	// 	run_button.click(),
	// 	page.waitForResponse("**/api/predict/")
	// ]);

	// const json = await page.locator("data-testid=json");
	// await expect(json).toContainText(`Covid: 0.75, Lung Cancer: 0.25`);
});
