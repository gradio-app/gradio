import { test, expect } from "@gradio/tootils";

test("updates frontend correctly", async ({ page }) => {
	await expect(page.locator("gradio-app")).toContainText("No Input Provided");

	const input_text = await page.getByLabel("input");
	await input_text.fill("Cat");
	await input_text.press("Enter");

	await expect(page.locator("gradio-app")).not.toContainText(
		"No Input Provided"
	);
	let textarea_count = await page.locator("textarea").count();
	expect(textarea_count).toBe(4); // 3 + 1 for input box
	let button_count = await page.locator("button").count();
	expect(button_count).toBe(1); // 0 + 1 for show_api button

	const output_as_button = page.getByText("button");
	await output_as_button.click();
	await input_text.fill("Snake");
	await input_text.press("Enter");

	await page.waitForSelector("gradio-app button.lg");
	await expect(page.locator("gradio-app")).not.toContainText(
		"No Input Provided"
	);
	textarea_count = await page.locator("textarea").count();
	expect(textarea_count).toBe(1); // 0 + 1 for input box
	button_count = await page.locator("button").count();
	expect(button_count).toBe(6); // 5 + 1 for show_api button

	await input_text.clear();
	await input_text.press("Enter");

	await expect(page.locator("gradio-app")).toContainText("No Input Provided");
	textarea_count = await page.locator("textarea").count();
	expect(textarea_count).toBe(1); // 0 + 1 for input box
	button_count = await page.locator("button").count();
	expect(button_count).toBe(1); // 0 + 1 for show_api button
});
