import { test, expect } from "@self/tootils";

test("test custom_buttons of the chatbot", async ({ page }) => {
	await expect(page.getByLabel("Concatenated Chat")).toHaveValue(
		"User message 1.|User message 2.|Chatbot message 1."
	);

	await page.getByRole("button", { name: "Example1" }).click();
	await expect(page.getByLabel("Concatenated Chat")).toHaveValue(
		"User message 1.|User message 1.|User message 2.|User message 2.|Chatbot message 1.|Chatbot message 1."
	);

	await page.getByRole("button", { name: "Example2" }).click();
	await expect(page.getByLabel("Concatenated Chat")).toHaveValue(
		"User message 1.|User message 1.|User message 1.|User message 1.|User message 1.|User message 1."
	);

	await page.getByRole("button", { name: "Example3" }).nth(1).click();
	await expect(page.getByLabel("Concatenated Chat")).toHaveValue(
		"User message 1.|User message 1.|User message 1.|User message 1.|User message 1.|User message 1."
	);
});
