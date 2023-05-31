import { test, expect, Page } from "@playwright/test";
import { mock_theme, wait_for_page, mock_api, mock_demo } from "./utils";

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
