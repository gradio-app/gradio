import { test, expect, go_to_testcase } from "@gradio/tootils";

for (const msg_format of ["tuples", "messages"]) {
	test(`msg format ${msg_format} chatinterface works with streaming functions and all buttons behave as expected`, async ({
		page
	}) => {
		if (msg_format === "messages") {
			await go_to_testcase(page, "messages");
		}
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

	test(`msg format ${msg_format} the api recorder correctly records the api calls`, async ({
		page
	}) => {
		if (msg_format === "messages") {
			await go_to_testcase(page, "messages");
		}
		const textbox = page.getByPlaceholder("Type a message...");
		const submit_button = page.getByRole("button", { name: "Submit" });
		await textbox.fill("hi");

		await page.getByRole("button", { name: "Use via API logo" }).click();
		await page.locator("#start-api-recorder").click();
		await submit_button.click();
		await expect(textbox).toHaveValue("");
		await expect(page.locator(".bot p").first()).toContainText(
			/\- You typed: hi/
		);
		const api_recorder = await page.locator("#api-recorder");
		await api_recorder.click();
		await expect(page.locator("#num-recorded-api-calls")).toContainText(
			"🪄 Recorded API Calls [5]"
		);
	});
}
