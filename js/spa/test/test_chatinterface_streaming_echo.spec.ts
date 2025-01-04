import { test, expect, go_to_testcase } from "@self/tootils";

const cases = [
	"tuples",
	"messages",
	"multimodal_tuples",
	"multimodal_messages",
	"multimodal_non_stream"
];

for (const test_case of cases) {
	test(`test case ${test_case} chatinterface works with streaming functions and all buttons behave as expected`, async ({
		page
	}) => {
		if (cases.slice(1).includes(test_case)) {
			await go_to_testcase(page, test_case);
		}
		const submit_button = page.locator(".submit-button");
		const textbox = page.getByTestId("textbox").first();

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
		await expect(page.locator(".bot.message")).toHaveCount(2);

		await page.getByLabel("undo").first().click();
		await expect(page.locator(".bot.message")).toHaveCount(1);
		await expect(textbox).toHaveValue("hi");

		await page.getByLabel("retry").first().click();
		const expected_text_el_2 = page.locator(".bot p", {
			hasText: "Run 3 - You typed: hello"
		});
		await expect(expected_text_el_2).toBeVisible();

		await expect(page.locator(".bot.message")).toHaveCount(1);

		await textbox.fill("hi");
		await submit_button.click();
		await expect(textbox).toHaveValue("");
		const expected_text_el_3 = page.locator(".bot p", {
			hasText: "Run 4 - You typed: hi"
		});
		await expect(expected_text_el_3).toBeVisible();
		await expect(page.locator(".bot.message")).toHaveCount(2);
		await page.getByLabel("clear").first().click();
		await expect(page.locator(".bot.message")).toHaveCount(0);
	});

	test(`test case ${test_case} the api recorder correctly records the api calls`, async ({
		page
	}) => {
		if (cases.slice(1).includes(test_case)) {
			await go_to_testcase(page, test_case);
		}
		const textbox = page.getByTestId("textbox").first();
		const submit_button = page.locator(".submit-button");
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
			`🪄 Recorded API Calls`
		);
	});
}

test("test stopping generation", async ({ page }) => {
	const submit_button = page.locator(".submit-button");
	const textbox = page.getByPlaceholder("Type a message...");

	const long_string = "abc".repeat(1000);

	await textbox.fill(long_string);
	await submit_button.click();

	await expect(page.locator(".bot.message").first()).toContainText("abc");
	const stop_button = page.locator(".stop-button");

	await stop_button.click();

	await expect(page.locator(".bot.message").first()).toContainText("abc");
	await page.waitForTimeout(1000);

	const current_content = await page
		.locator(".bot.message")
		.first()
		.textContent();
	await page.waitForTimeout(1000);
	const new_content = await page.locator(".bot.message").first().textContent();
	await expect(current_content).toBe(new_content);
	await expect(new_content!.length).toBeLessThan(3000);
});

test("editing messages", async ({ page }) => {
	const submit_button = page.locator(".submit-button");
	const textbox = page.locator(".input-container textarea");
	const chatbot = page.getByLabel("chatbot conversation");

	await textbox.fill("Lets");
	await submit_button.click();
	await expect(chatbot).toContainText("You typed: Lets");

	await textbox.fill("Test");
	await submit_button.click();
	await expect(chatbot).toContainText("You typed: Test");

	await textbox.fill("This");
	await submit_button.click();
	await expect(chatbot).toContainText("You typed: This");

	await page.getByLabel("Edit").nth(1).click();
	await page.getByLabel("chatbot conversation").getByRole("textbox").fill("Do");
	await page.getByLabel("Submit").click();

	await expect(chatbot).toContainText("You typed: Do");
	await expect(chatbot).not.toContainText("You typed: This");
});
