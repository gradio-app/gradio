import { test, expect, Page } from "@playwright/test";
import { mock_theme, wait_for_page } from "./utils";

function mock_demo(page: Page, demo: string) {
	return page.route("**/config", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `../../demo/${demo}/config.json`
		});
	});
}

function mock_api(page: Page, body: Array<unknown>) {
	return page.route("**/run/predict", (route) => {
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

test("a component acts as both input and output", async ({ page }) => {
	await mock_demo(page, "input_output");
	await mock_api(page, [["tset"]]);
	await mock_theme(page);
	await wait_for_page(page);

	const textbox = await page.getByLabel("Input-Output");

	await textbox.fill("test");
	await Promise.all([
		page.click("button"),
		page.waitForResponse("**/run/predict")
	]);
	await expect(await textbox).toHaveValue("tset");
});
