import { test, expect, Page } from "@playwright/test";

function mock_demo(page: Page, demo: string) {
	return page.route("**/config", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `../../../demo/${demo}/config.json`
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
	await mock_demo(page, "blocks_xray");
	await page.goto("http://localhost:3000");

	const description = await page.locator(".output-markdown");
	await expect(description).toContainText("Detect Disease From Scan");

	const checkboxes = await page.locator("data-testid=checkbox-group");
	await expect(checkboxes).toContainText("Covid Malaria Lung Cancer");

	const tabs = await page.locator("button", { hasText: /X-ray|CT Scan/ });
	await expect(tabs).toHaveCount(2);
});

test("can run an api request and display the data", async ({ page }) => {
	await mock_demo(page, "blocks_xray");
	await mock_api(page, [
		[
			{
				Covid: 0.75,
				"Lung Cancer": 0.25
			}
		],
		[
			{
				Covid: 0.75,
				"Lung Cancer": 0.25
			}
		]
	]);

	await page.goto("http://localhost:3000");

	// await page.locator('button:has-text("Covid")').click();
	// await page.locator('button:has-text("Lung Cancer")').click();

	await page.check("label:has-text('Covid')");
	await page.check("label:has-text('Lung Cancer')");

	const run_button = await page.locator("button", { hasText: /Run/ });

	await Promise.all([
		run_button.click(),
		page.waitForResponse("**/api/predict/")
	]);

	const json = await page.locator(".output-json");
	await expect(json).toContainText(`Covid: 0.75, Lung Cancer: 0.25`);
});
