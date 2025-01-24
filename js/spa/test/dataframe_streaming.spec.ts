import { test, expect } from "@self/tootils";

test("DataFrame updates and events are tracked correctly", async ({ page }) => {
	await expect(page.getByLabel("Change events")).toHaveValue("0");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(page.getByLabel("Sum of values")).toHaveValue("0");

	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await expect(
		page.getByRole("table", { name: "Dataframe" }).locator("td").first()
	).toHaveText("2");

	await expect(page.getByLabel("Change events")).toHaveValue("2");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(page.getByLabel("Sum of values")).toHaveValue("50");

	await page
		.locator(".tbody > tr > td > .cell-wrap > .table-cell-text")
		.first()
		.click();
	await page.getByRole("textbox").fill("100");
	await page.getByRole("textbox").press("Enter");

	await expect(page.getByLabel("Change events")).toHaveValue("3");
	await expect(page.getByLabel("Input events")).toHaveValue("1");
	await expect(page.getByLabel("Sum of values")).toHaveValue("148");
});
