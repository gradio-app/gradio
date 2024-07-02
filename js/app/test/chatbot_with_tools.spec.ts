import { test, expect } from "@gradio/tootils";

test("Chatbot can support agentic demos by displaying messages with metadata", async ({
	page
}) => {
	await page.getByRole("button", { name: "Get San Francisco Weather" }).click();

	await expect(page.getByLabel("bot's message: API Error when")).toBeVisible();
	await expect(page.getByLabel("bot's message: Weather 72")).toBeVisible();
	await expect(page.getByLabel("bot's message: It's a sunny")).toBeVisible();
});
