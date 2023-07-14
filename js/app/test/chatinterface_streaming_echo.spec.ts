import { test, expect } from "@gradio/tootils";

test("chatinterface works with streaming functions and all buttons behave as expected", async ({
	page
}) => {
	const submit_button = await page.locator("button").nth(0);
	const retry_button = await page.locator("button").nth(2);
	const delete_last_button = await page.locator("button").nth(3);
	const clear_button = await page.locator("button").nth(4);
	const textbox = await page.getByTestId("textbox").nth(0);

	let last_iteration;
	page.on("websocket", (ws) => {
		last_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string).msg === "process_completed";
			}
		});
	});

	await textbox.fill("hello");
	await submit_button.click();
	await last_iteration;
	await expect(textbox).toHaveValue("");
	await expect.poll(async () => page.locator('.bot.message p').count()).toBe(1);
	const bot_message_0 = await page.locator(".bot.message p").nth(0);
	await expect(bot_message_0).toContainText("You typed: hello"); 

	await textbox.fill("hi");
	await submit_button.click();
	await last_iteration;	
	await expect(textbox).toHaveValue("");
	await expect.poll(async () => page.locator('.bot.message p').count()).toBe(2);
	const bot_message_1 = await page.locator(".bot.message p").nth(1);
	await expect(bot_message_1).toContainText("You typed: hi"); 

	await retry_button.click();
	await last_iteration;
	await expect(textbox).toHaveValue("");
	await expect(bot_message_1).toContainText("You typed: hi"); 

	await delete_last_button.click();
	await expect.poll(async () => page.locator('.bot.message p').count()).toBe(1);

	await textbox.fill("salaam");
	await submit_button.click();
	await last_iteration;	
	await expect(textbox).toHaveValue("");
	await expect.poll(async () => page.locator('.bot.message p').count()).toBe(2);
	await expect(bot_message_1).toContainText("You typed: salaam"); 

	await clear_button.click();
	await expect.poll(async () => page.locator('.bot.message p').count()).toBe(0);
});
