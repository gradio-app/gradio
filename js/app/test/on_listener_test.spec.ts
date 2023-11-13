import { test, expect } from "@gradio/tootils";

test("On listener works.", async ({ page }) => {
	const name_box = await page.locator("textarea").nth(0);
	const output_box = await page.locator("textarea").nth(1);
	const trigger1_box = await page.locator("textarea").nth(2);
	const trigger2_box = await page.locator("textarea").nth(3);

	name_box.fill("Jimmy");
	await page.click("text=Greet");
	await expect(output_box).toHaveValue("Hello Jimmy!");
	await expect(trigger1_box).toHaveValue("Button");
	await expect(name_box).toHaveValue("");
	await expect(trigger2_box).toHaveValue("Button");

	await name_box.fill("Sally");
	await name_box.press("Enter");
	await expect(output_box).toHaveValue("Hello Sally!");
	await expect(trigger1_box).toHaveValue("Textbox");
	await expect(name_box).toHaveValue("");
	await expect(trigger2_box).toHaveValue("Textbox");
});
