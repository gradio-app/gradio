import { test, expect, Page } from "@playwright/test";

function mock_demo(page: Page, demo: string) {
	return page.route("http://localhost:7860/config", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `../../../demo/${demo}/config.json`
		});
	});
}

test("basic test", async ({ page }) => {
	await mock_demo(page, "xray_blocks");

	await page.goto("http://localhost:3000");

	const title = await page.locator(".output-html");
	await expect(title).toContainText("Detect Disease From Scan");
});
