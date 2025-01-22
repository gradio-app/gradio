import { test, expect } from "@self/tootils";

test("DataFrame updates and events are tracked correctly", async ({ page }) => {
	await expect(page.getByLabel("Change events")).toHaveValue("0");
	await expect(page.getByLabel("Input events")).toHaveValue("0");

	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await expect(
		page.getByRole("table", { name: "Dataframe" }).locator("td").first()
	).toHaveText("2");

	await expect(page.getByLabel("Change events")).toHaveValue("2");
	await expect(page.getByLabel("Input events")).toHaveValue("0");
});
