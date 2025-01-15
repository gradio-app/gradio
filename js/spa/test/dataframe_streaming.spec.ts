import { test, expect } from "@self/tootils";

test("DataFrame updates correctly when button is clicked", async ({ page }) => {
	await page.getByRole("button", { name: "Update DataFrame" }).click();
	await expect(
		page.getByRole("table", { name: "Dataframe" }).locator("td").first()
	).toHaveText("2");
});
