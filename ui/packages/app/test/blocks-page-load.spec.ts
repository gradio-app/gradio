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

test("renders the correct elements", async ({ page }) => {
	await mock_demo(page, "blocks_page_load");
	await page.goto("http://localhost:3000");

	await expect(page.locator('textarea').first()).toHaveText("Frank")
	await expect(page.locator('textarea').last()).toHaveText("Welcome! This page has loaded for Frank")
});
