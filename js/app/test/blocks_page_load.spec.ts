import { test, expect, Page } from "@playwright/test";
import { mock_theme, wait_for_page, mock_api, mock_demo } from "./utils";

test("renders the correct elements", async ({ page }) => {
	await mock_demo(page, "blocks_page_load");
	await mock_api(page, [["Welcome! This page has loaded for Frank"]]);
	await mock_theme(page);
	await wait_for_page(page);

	const textbox = await page.getByLabel("Name");

	await textbox.fill("Frank");
	await expect(await textbox).toHaveValue("Frank");
	await expect(await page.getByLabel("Output")).toHaveValue(
		"Welcome! This page has loaded for Frank"
	);
});
