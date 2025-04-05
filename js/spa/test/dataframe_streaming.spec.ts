import { test, expect } from "@self/tootils";

test("DataFrame updates and events are tracked correctly", async ({ page }) => {
	await expect(page.getByLabel("Change events")).toHaveValue("0");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(page.getByLabel("Sum of values")).toHaveValue("0");

	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await expect(
		page.getByRole("table").nth(1).locator(`[data-row='0'][data-col='0']`)
	).toHaveText("2");

	await expect(page.getByLabel("Change events")).toHaveValue("2");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(page.getByLabel("Sum of values")).toHaveValue("50");
});
