import { test, expect } from "@self/tootils";

test("shows the results tab when results > 0", async ({ page }) => {
	await page.getByRole("button", { name: "Start Practice" }).click();
	await expect(
		page.getByText("Please enter word prompts into the table.")
	).toBeAttached();
	await page.getByLabel("Close").click();

	await page
		.getByRole("button", { name: "front back" })
		.getByRole("button")
		.nth(2)
		.dblclick();
	await page
		.getByRole("button", { name: "front back" })
		.locator("tbody")
		.getByRole("textbox")
		.fill("dog");
	await page
		.getByRole("button", { name: "front back" })
		.locator("tbody")
		.getByRole("textbox")
		.press("Enter");

	await page
		.getByRole("button", { name: "front back" })
		.getByRole("button")
		.nth(4)
		.dblclick();
	await page
		.getByRole("button", { name: "front back" })
		.locator("tbody")
		.getByRole("textbox")
		.fill("cat");
	await page
		.getByRole("button", { name: "front back" })
		.locator("tbody")
		.getByRole("textbox")
		.press("Enter");

	await page.getByText("Start Practice").dblclick();
});
