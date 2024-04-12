import { test, expect } from "@gradio/tootils";

test("accordion stays open when interacting with the slider", async ({
	page
}) => {
	await page.getByRole("button", { name: "Open for More! ▼" }).click();

	await page.getByLabel("Textbox").nth(0).fill("123");

	await page.getByRole("button", { name: "Flip" }).click();
	await expect(page.getByLabel("Textbox").nth(1)).toHaveValue("321");

	await expect(page.getByText("Look at me...")).toBeVisible();
});
