import { test, expect, Page } from "@playwright/test";
import { mock_theme, wait_for_page, mock_api, mock_demo } from "./utils";

test("renders the correct elements", async ({ page }) => {
	await mock_demo(page, "blocks_xray");
	await mock_theme(page);
	await wait_for_page(page);

	const description = await page.getByTestId("markdown");
	await expect(description).toContainText("Detect Disease From Scan");

	const checkboxes = await page.getByTestId("checkbox-group");
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

	await mock_theme(page);
	await wait_for_page(page);

	await page.getByLabel("Covid").check();
	await page.getByLabel("Lung Cancer").check();

	const run_button = await page.locator("button", { hasText: /Run/ }).first();

	await Promise.all([
		run_button.click(),
		page.waitForResponse("**/run/predict")
	]);

	const json = await page.getByTestId("json").first();
	await expect(json).toContainText(`Covid: 0.75, Lung Cancer: 0.25`);
});
