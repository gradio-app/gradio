import { test, expect } from "@self/tootils";

test("table rows are highlighted correctly", async ({ page }) => {
	const first_tr = await page.locator("tbody tr").first();
	await expect(first_tr).toHaveCSS("background-color", "rgb(255, 255, 255)");

	const second_tr = await page.locator("tbody tr").nth(1);
	await expect(second_tr).toHaveCSS("background-color", "rgb(250, 250, 250)");
});
