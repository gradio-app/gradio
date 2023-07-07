import { test, expect } from "@gradio/tootils";

test("test change only gets triggered once", async ({ page }) => {
	const counter = await page.getByLabel("Change counter")
	await expect(counter).toHaveValue("0");

	const image_input = await page.locator("#image-original input")
	await image_input.setInputFiles("./test/files/cheetah1.jpg");

	await expect(counter).toHaveValue("1");

});

