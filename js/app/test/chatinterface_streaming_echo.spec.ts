import { test, expect } from "@gradio/tootils";

test("chatinterface works with streaming functions and all buttons behave as expected", async ({
	page
}) => {
	const submit_button = await page.locator("button").nth(0);
	const retry_button = await page.locator("button").nth(2);
	const undo_button = await page.locator("button").nth(3);
	const clear_button = await page.locator("button").nth(4);
	const textbox = await page.getByTestId("textbox").nth(0);

	let iterations: Promise<any>[] = [];
	page.on("websocket", (ws) => {
		iterations.push(
			ws.waitForEvent("framereceived", {
				predicate: (event) => {
					return (
						JSON.parse(event.payload as string).msg === "process_completed"
					);
				}
			})
		);
	});

	await textbox.fill("hello");
	await submit_button.click();
	await iterations[0];
	await expect(textbox).toHaveValue("");
	await expect.poll(async () => page.locator(".bot.message p").count()).toBe(1);
	const bot_message_0 = await page.locator(".bot.message p").nth(0);
	await expect(bot_message_0).toContainText("You typed: hello");

	await textbox.fill("hi");
	await submit_button.click();
	await iterations[1];
	await expect(textbox).toHaveValue("");
	await expect.poll(async () => page.locator(".bot.message p").count()).toBe(2);
	const bot_message_1 = await page.locator(".bot.message p").nth(1);
	await expect(bot_message_1).toContainText("You typed: hi");

	await retry_button.click();
	await iterations[2];
	await expect(textbox).toHaveValue("");
	await expect(bot_message_1).toContainText("You typed: hi");

	await undo_button.click();
	await iterations[3];
	await expect.poll(async () => page.locator(".bot.message p").count()).toBe(1);
	await expect(textbox).toHaveValue("hi");

	await textbox.fill("salaam");
	await submit_button.click();
	await iterations[4];
	await expect(textbox).toHaveValue("");
	await expect.poll(async () => page.locator(".bot.message p").count()).toBe(2);
	await expect(bot_message_1).toContainText("You typed: salaam");

	await clear_button.click();
	await expect.poll(async () => page.locator(".bot.message p").count()).toBe(0);
});
