import { test, expect } from "@gradio/tootils";

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
		.nth(3)
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

	await page.getByText("New row").click();

	await page.waitForTimeout(1000);
	await page.getByText("Start Practice").dblclick();
});
