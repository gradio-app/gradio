import { test, expect } from "@self/tootils";

test("shows the results tab when results > 0", async ({ page }) => {
	await page.getByRole("button", { name: "Start Practice" }).click();
	await expect(
		page.getByText("Please enter word prompts into the table.")
	).toBeAttached();
	await page.getByLabel("Close").click();
	await page.getByLabel("Add row").click();
	await page.getByText("Start Practice").click();
	await expect(
		page.getByText("Please enter word prompts into the table.")
	).not.toBeAttached();
});
