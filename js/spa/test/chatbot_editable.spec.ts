import { test, expect } from "@self/tootils";

test("test editing chatbot messages", async ({ page }) => {
	await page.getByRole("button", { name: "Add Message" }).click();
	await expect(page.getByLabel("Concatenated Chat 1")).toHaveValue(
		"I'm a user|I'm a bot"
	);
	await page.getByRole("button", { name: "Add Message" }).click();
	await expect(page.getByLabel("Concatenated Chat 1")).toHaveValue(
		"I'm a user|I'm a bot|I'm a user|I'm a bot"
	);
	await page.getByLabel("Edit").nth(0).click();
	await page.locator("textarea").first().fill("GRADIO");
	await page.getByLabel("Submit").click();
	await expect(page.getByLabel("Edited Message")).toHaveValue(
		"from I'm a user to GRADIO at 0"
	);
	await page.getByLabel("Edit").nth(2).click();
	await page.locator("textarea").first().fill("FAIL");
	await page.getByLabel("Cancel").click();
	await page.getByLabel("Edit").nth(3).click();
	await page.locator("textarea").first().fill("SUCCESS");
	await page.getByLabel("Submit").click();
	await expect(page.getByLabel("Edited Message")).toHaveValue(
		"from I'm a user to SUCCESS at [1, 0]"
	);
	await expect(page.getByLabel("Concatenated Chat 1")).toHaveValue(
		"GRADIO|I'm a bot|I'm a user|I'm a bot"
	);
	await expect(page.getByLabel("Concatenated Chat 2")).toHaveValue(
		"I'm a user|I'm a bot|SUCCESS|I'm a bot"
	);
});
