import { test, expect } from "@gradio/tootils";

test("clicking through tabs shows correct content", async ({ page }) => {
	await expect(page.locator("body")).toContainText("Incomplete Tasks (0)");
	await expect(page.locator("body")).toContainText("Complete Tasks (0)");

	const input_text = page.getByLabel("Task Name");

	await input_text.fill("eat");
	await input_text.press("Enter");

	await expect(page.locator("body")).not.toContainText("Incomplete Tasks (0)");
	await expect(page.locator("body")).toContainText("Incomplete Tasks (1)");
	await expect(page.locator("body")).toContainText("Complete Tasks (0)");
	await expect(page.locator("textarea").nth(1)).toHaveValue("eat");

	await input_text.fill("pray");
	await input_text.press("Enter");

	await expect(page.locator("body")).toContainText("Incomplete Tasks (2)");
	await expect(page.locator("body")).toContainText("Complete Tasks (0)");
	await expect(page.locator("textarea").nth(2)).toHaveValue("pray");

	await input_text.fill("love");
	await input_text.press("Enter");

	await expect(page.locator("body")).toContainText("Incomplete Tasks (3)");
	await expect(page.locator("body")).toContainText("Complete Tasks (0)");
	await expect(page.locator("textarea").nth(1)).toHaveValue("eat");
	await expect(page.locator("textarea").nth(2)).toHaveValue("pray");
	await expect(page.locator("textarea").nth(3)).toHaveValue("love");

	const done_btn_for_eat = page
		.locator("button")
		.filter({ hasText: "Done" })
		.first();
	await done_btn_for_eat.click();

	await expect(page.locator("body")).toContainText("Incomplete Tasks (2)");
	await expect(page.locator("body")).toContainText("Complete Tasks (1)");

	const delete_btn_for_love = page
		.locator("button")
		.filter({ hasText: "Delete" })
		.last();
	await delete_btn_for_love.click();

	await expect(page.locator("body")).toContainText("Incomplete Tasks (1)");
	await expect(page.locator("body")).toContainText("Complete Tasks (1)");
});
