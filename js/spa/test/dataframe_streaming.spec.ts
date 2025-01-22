import { test, expect } from "@self/tootils";

test("DataFrame updates and events are tracked correctly", async ({ page }) => {
	await expect(page.getByLabel("Change events")).toHaveValue("0");
	await expect(page.getByLabel("Input events")).toHaveValue("0");

	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await expect(page.getByLabel("Change events")).toHaveValue("2");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
	await expect(
		page.getByRole("table", { name: "Dataframe" }).locator("td").first()
	).toHaveText("2");

	const headerCell = page.getByRole("table", { name: "Dataframe" }).locator("th").first();
	await headerCell.dblclick();
	await page.keyboard.type("New Header");
	await page.keyboard.press("Enter");
	await expect(page.getByLabel("Change events")).toHaveValue("3");
	await expect(page.getByLabel("Input events")).toHaveValue("1");

	const bodyCell = page.getByRole("table", { name: "Dataframe" }).locator("td").first();
	await bodyCell.dblclick();
	await page.keyboard.type("42");
	await page.keyboard.press("Enter");
	await expect(page.getByLabel("Change events")).toHaveValue("4");
	await expect(page.getByLabel("Input events")).toHaveValue("2");

	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await expect(page.getByLabel("Change events")).toHaveValue("6");
	await expect(page.getByLabel("Input events")).toHaveValue("2");
});
