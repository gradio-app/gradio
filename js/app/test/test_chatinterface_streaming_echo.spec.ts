import { test, expect } from "@gradio/tootils";

test("chatinterface works with streaming functions and all buttons behave as expected", async ({
	page
}) => {
	const submit_button = page.getByRole("button", { name: "Submit" });
	const retry_button = page.getByRole("button", { name: "🔄 Retry" });
	const undo_button = page.getByRole("button", { name: "↩️ Undo" });
	const clear_button = page.getByRole("button", { name: "🗑️ Clear" });
	const textbox = page.getByPlaceholder("Type a message...");

	await textbox.fill("hello");
	await submit_button.click();

	await expect(textbox).toHaveValue("");
	const expected_text_el_0 = page.locator(".bot  p", {
		hasText: "Run 1 - You typed: hello"
	});
	await expect(expected_text_el_0).toBeVisible();
	await expect
		.poll(async () => page.locator(".bot.message").count(), { timeout: 2000 })
		.toBe(1);

	await textbox.fill("hi");
	await submit_button.click();
	await expect(textbox).toHaveValue("");
	const expected_text_el_1 = page.locator(".bot p", {
		hasText: "Run 2 - You typed: hi"
	});
	await expect(expected_text_el_1).toBeVisible();
	await expect
		.poll(async () => page.locator(".bot.message").count(), { timeout: 2000 })
		.toBe(2);

	await undo_button.click();
	await expect
		.poll(async () => page.locator(".message.bot").count(), { timeout: 5000 })
		.toBe(1);
	await expect(textbox).toHaveValue("hi");

	await retry_button.click();
	const expected_text_el_2 = page.locator(".bot p", {
		hasText: ""
	});
	await expect(expected_text_el_2).toBeVisible();

	await expect
		.poll(async () => page.locator(".message.bot").count(), { timeout: 5000 })
		.toBe(1);

	await textbox.fill("hi");
	await submit_button.click();
	await expect(textbox).toHaveValue("");
	const expected_text_el_3 = page.locator(".bot p", {
		hasText: "Run 4 - You typed: hi"
	});
	await expect(expected_text_el_3).toBeVisible();
	await expect
		.poll(async () => page.locator(".bot.message").count(), { timeout: 2000 })
		.toBe(2);

	await clear_button.click();
	await expect
		.poll(async () => page.locator(".bot.message").count(), { timeout: 5000 })
		.toBe(0);
});

test("the api recorder correctly records the api calls", async ({ page }) => {
	const textbox = page.getByPlaceholder("Type a message...");
	const submit_button = page.getByRole("button", { name: "Submit" });
	await textbox.fill("hi");

	await page.getByRole("button", { name: "Use via API logo" }).click();
	await page.locator("#start-api-recorder").click();
	await submit_button.click();
	await expect(textbox).toHaveValue("");
	const api_recorder = await page.locator("#api-recorder");
	await api_recorder.click();

	const num_calls = await page.locator("#num-recorded-api-calls").innerText();
	await expect(num_calls).toBe("🪄 Recorded API Calls [5]");
});
