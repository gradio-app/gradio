import { test, expect, getByLabelText } from "@gradio/tootils";
import type { Response } from "@playwright/test";

test("gr.ClearButton clears every component's value", async ({
	page
}) => {

	await page.click("text=Clear");
	await page.click("text=Get Values")
	expect(await page.getByLabel("Are all cleared?").inputValue()).toBe("True");
});

