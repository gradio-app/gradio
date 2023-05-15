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

export function mock_demo(page: Page, demo: string) {
	return Promise.all([
		page.route("**/config", (route) => {
			return route.fulfill({
				headers: {
					"Access-Control-Allow-Origin": "*"
				},
				path: `../../demo/${demo}/config.json`
			});
		}),
		page.route("**/info", (route) => {
			return route.fulfill({
				headers: {
					"Access-Control-Allow-Origin": "*"
				},
				path: `./test/mocks/info-${demo}.json`
			});
		})
	]);
}

export function mock_api(page: Page, body?: Array<unknown>) {
	return page.route("**/run/predict", (route) => {
		const id = JSON.parse(route.request().postData()!).fn_index;
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			body: JSON.stringify({
				data: body === undefined ? [] : body[id]
			})
		});
	});
}
