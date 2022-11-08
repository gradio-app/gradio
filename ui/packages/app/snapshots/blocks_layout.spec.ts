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

test("blocks layout", async ({ page }) => {
	await mock_demo(page, "blocks_layout");
	await page.goto("http://localhost:3000");
	await expect(page).toHaveScreenshot();
});
