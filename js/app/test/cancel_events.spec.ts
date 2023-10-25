import { test, expect } from "@gradio/tootils";

test("when using an iterative function the UI should update over time as iteration results are received", async ({
	page
}) => {
	const start_button = await page.locator("button", {
		hasText: /Start Iterating/
	});
	const textbox = await page.getByLabel("Iterative Output");

	await start_button.click();
	await expect(textbox).toHaveValue("2");
	await expect(textbox).toHaveValue("5");
	await expect(textbox).toHaveValue("8");
});

test("when using an iterative function it should be possible to cancel the function, after which the UI should stop updating", async ({
	page
}) => {
	const start_button = await page.locator("button", {
		hasText: /Start Iterating/
	});
	const stop_button = await page.locator("button", {
		hasText: /Stop Iterating/
	});
	const textbox = await page.getByLabel("Iterative Output");

	await start_button.click();
	await expect(textbox).toHaveValue("2");
	await stop_button.click();
	await page.waitForTimeout(1000);
	await expect(textbox).toHaveValue(new RegExp("[2-7]"));
});
