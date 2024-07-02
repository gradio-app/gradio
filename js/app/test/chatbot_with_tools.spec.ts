import { test, expect } from "@gradio/tootils";

test("Chatbot can support agentic demos by displaying messages with metadata", async ({
	page
}) => {
	await page.getByRole("button", { name: "Get San Francisco Weather" }).click();
	await expect(
		page.locator("button").filter({ hasText: "💥 Error" })
	).toBeVisible();
	await expect(
		page.locator("button").filter({ hasText: "🛠️ Used tool Weather" })
	).toBeVisible();
	await expect(
		page.locator("button").filter({ hasText: "It's a sunny day in San" })
	).toBeVisible();
});
