import { test, expect } from "@self/tootils";

test("Chatbot can support agentic demos by displaying messages with metadata", async ({
	page
}) => {
	await page.getByRole("button", { name: "Get San Francisco Weather" }).click();
	await expect(
		await page.locator("div").filter({ hasText: "💥 Error" }).nth(1)
	).toBeVisible();
	await expect(
		page.locator("span").filter({ hasText: "🛠️ Used tool" })
	).toBeVisible();
	await expect(page.locator(".bot")).toContainText(
		"It's a sunny day in San Francisco"
	);
});
