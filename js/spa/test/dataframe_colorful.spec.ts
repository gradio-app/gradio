import { test, expect } from "@self/tootils";

test("table rows are highlighted correctly", async ({ page }) => {
	const first_row = await page.locator(".virtual-body .virtual-row").first();
	await expect(first_row).toHaveCSS("background-color", "rgb(255, 255, 255)");

	const second_row = await page
		.locator(".virtual-body .virtual-row")
		.nth(1);
	await expect(second_row).toHaveCSS(
		"background-color",
		"rgb(250, 250, 250)"
	);
});
