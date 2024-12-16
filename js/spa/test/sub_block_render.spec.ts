import { test, expect } from "@self/tootils";

test("submit works", async ({ page }) => {
	await page.getByTestId("textbox").first().focus();
	await page.getByTestId("textbox").first().fill("test");
	await page.keyboard.press("Enter");

	await expect(page.getByLabel("Prompt", { exact: true })).toHaveValue("image");
});

test("examples work", async ({ page }) => {
	await page.getByText("A serious capybara at work, wearing a suit").click();

	await expect(page.getByLabel("Prompt", { exact: true })).toHaveValue("image");
});
