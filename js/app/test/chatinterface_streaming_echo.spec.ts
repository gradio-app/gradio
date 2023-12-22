import { test, expect } from "@gradio/tootils";

test("chatinterface works with streaming functions and all buttons behave as expected", async ({
	page
}) => {
	const submit_button = await page.getByRole("button", { name: "Submit" });
	const retry_button = await page.getByRole("button", { name: "🔄 Retry" });
	const undo_button = await page.getByRole("button", { name: "↩️ Undo" });
	const clear_button = await page.getByRole("button", { name: "🗑️ Clear" });
	const textbox = await page.getByPlaceholder("Type a message...");

	await textbox.fill("hello");
	await submit_button.click();
	await expect(textbox).toHaveValue("");
	const bot_message_0 = await page.locator(".bot.message").nth(0);
	await expect(bot_message_0).toContainText("You typed: hello");

	await textbox.fill("hi");
	await submit_button.click();
	await expect(textbox).toHaveValue("");
	const bot_message_1 = await page.locator(".bot").nth(1);
	await expect(bot_message_1).toContainText("You typed: hi");

	await retry_button.click();
	await expect(textbox).toHaveValue("");
	await expect(page.locator(".bot").nth(1)).toContainText("You typed: hi");

	await undo_button.click();
	await expect
		.poll(async () => page.locator(".message.bot").count(), { timeout: 5000 })
		.toBe(1);
	await expect(textbox).toHaveValue("hi");

	await textbox.fill("salaam");
	await submit_button.click();
	await expect(textbox).toHaveValue("");
	await expect(page.locator(".bot").nth(1)).toContainText("You typed: salaam");

	await clear_button.click();
	await expect
		.poll(async () => page.locator(".bot.message").count(), { timeout: 5000 })
		.toBe(0);
});
