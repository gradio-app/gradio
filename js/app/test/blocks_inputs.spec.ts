import { test, expect } from "@playwright/test";
import { mock_theme, wait_for_page, mock_api, mock_demo } from "./utils";

test("renders the correct elements", async ({ page }) => {
	await mock_demo(page, "blocks_inputs");
	await mock_api(page, [["hi dawood"]]);
	await mock_theme(page);
	await wait_for_page(page);

	const textboxes = await page.getByLabel("Input");

	const textboxOne = await textboxes.first();
	const textboxTwo = await textboxes.last();

	await textboxOne.fill("hi");
	await textboxTwo.fill("dawood");
	await Promise.all([
		page.click('text="Submit"'),
		page.waitForResponse("**/run/predict")
	]);

	await expect(await page.getByLabel("Output")).toHaveValue("hi dawood");
});
