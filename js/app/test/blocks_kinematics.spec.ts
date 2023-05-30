import { test, expect, Page } from "@playwright/test";
import { mock_theme, wait_for_page, mock_api, mock_demo } from "./utils";

test("renders the correct elements", async ({ page }) => {
	await mock_demo(page, "blocks_kinematics");
	await mock_api(page, [[25, 45]]);
	await mock_theme(page);
	await wait_for_page(page);

	await Promise.all([
		page.click("button:has-text('Run')"),
		page.waitForResponse("**/run/predict")
	]);
});
