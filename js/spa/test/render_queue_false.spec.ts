import { test, expect } from "@self/tootils";

test("Test @gr.render with queue=False works correctly", async ({ page }) => {
	await expect(page.getByText("No Input Provided")).toBeVisible();

	const inputTextbox = page.getByLabel("Input Text");
	await inputTextbox.fill("f");

	await page.waitForTimeout(500);

	await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();

	await expect(page.getByLabel("Letter f")).toBeVisible();
	await expect(page.getByLabel("Letter f")).toHaveValue("f");
});
