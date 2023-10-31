import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	const description = await page.getByTestId("markdown");
	await expect(description).toContainText("Detect Disease From Scan");

	const checkboxes = await page.getByTestId("checkbox-group");
	await expect(checkboxes).toContainText("Covid Malaria Lung Cancer");

	const tabs = await page.locator("button", { hasText: /X-ray|CT Scan/ });
	await expect(tabs).toHaveCount(2);
});

test("can run an api request and display the data", async ({ page }) => {
	await page.getByTitle("Covid").check();
	await page.getByTitle("Lung Cancer").check();

	const run_button = await page.locator("button", { hasText: /Run/ }).first();
	await run_button.click();

	const json = await page.getByTestId("json").first();
	await expect(json).toContainText(`Covid: 0.25, Lung Cancer: 0.5`);
});
