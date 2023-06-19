import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	const textbox = await page.getByLabel("Name");

	await textbox.fill("Frank");
	await expect(await textbox).toHaveValue("Frank");
	await expect(await page.getByLabel("Output")).toHaveValue(
		"Welcome! This page has loaded for Frank"
	);
});
