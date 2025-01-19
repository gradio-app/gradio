import { test, expect } from "@self/tootils";

test("shows the results tab when results > 0", async ({ page }) => {
	await page.getByRole("button", { name: "Start Practice" }).click();
	await expect(
		page.getByText("Please enter word prompts into the table.")
	).toBeAttached();
	await page.getByLabel("Close").click();
	await page
		.getByRole("button", { name: "front back" })
		.locator("span")
		.nth(2)
		.click();
	await page.getByRole("textbox").fill("dog");
	await page
		.getByRole("row", { name: "dog ⋮" })
		.getByRole("button")
		.nth(2)
		.click();
	await page.getByRole("textbox").fill("cat");

	await page.getByText("Start Practice").dblclick();
});
