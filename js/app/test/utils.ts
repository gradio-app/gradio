import type { Page } from "@playwright/test";

export function mock_theme(page: Page) {
	return page.route("**/theme.css", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `./test/mocks/theme.css`
		});
	});
}

export async function wait_for_page(page: Page) {
	await page.goto("http://localhost:9876");
	await page.waitForResponse("**/theme.css");
}
