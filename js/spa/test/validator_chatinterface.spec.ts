import { test, expect } from "@self/tootils";

test(`Chatinterface correctly validates user message and displays error message`, async ({
	page
}) => {
	const submit_button = page.locator(".submit-button");
	const textbox = page.getByTestId("textbox").first();

	await textbox.fill("error");
	await submit_button.click();

	await expect(page.getByText("Can't be error")).toBeVisible();
	await textbox.fill("hello");
	await submit_button.click();

	const expected_text_el_0 = page.locator(".bot  p", {
		hasText: "You typed: hello"
	});
	await expect(expected_text_el_0).toBeVisible();
	await expect
		.poll(async () => page.locator(".bot.message").count(), { timeout: 2000 })
		.toBe(1);

	await expect(page.getByText("Can't be error")).not.toBeVisible();
});
