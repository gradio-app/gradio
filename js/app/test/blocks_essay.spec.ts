import { test, expect } from "@gradio/tootils";

test("updates frontend correctly", async ({ page }) => {
	const short_btn = await page.getByLabel("short");
	const long_btn = await page.getByLabel("long");
	const hidden_btn = await page.getByLabel("none");
	const textbox = await page.locator("textarea").first();

	textbox.fill("hello world");
	await long_btn.check();
	await expect(textbox).toHaveValue("Lorem ipsum dolor sit amet");
	await expect(textbox).toHaveAttribute("rows", "8");

	textbox.fill("hello world");
	await short_btn.check();
	await expect(textbox).toHaveValue("hello world");

	await hidden_btn.check();
	await expect(textbox).toBeHidden();
});

test("updates backend correctly", async ({ page }) => {
	const min_slider = await page.getByLabel("number input for min");
	const num = await page.getByLabel("input").first();
	const output = await page.getByLabel("output");

	await min_slider.fill("10");
	await num.fill("15");
	await num.press("Enter");
	await expect(output).toHaveValue("15");

	await num.fill("25");
	await num.press("Enter");
	await expect(output).toHaveValue("25");

	await num.fill("5");
	await num.press("Enter");
	await expect(output).toHaveValue("25");
});
