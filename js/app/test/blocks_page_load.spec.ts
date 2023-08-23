import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	const textbox = await page.getByLabel("Name");

	await textbox.fill("Frank");
	await expect(await textbox).toHaveValue("Frank");
	await expect(await page.getByLabel("Output")).toHaveValue(
		"Welcome! This page has loaded for Frank"
	);
});

test("renders the footer", async ({ page }) => {
	const footer = page.locator("footer");

	await expect(footer).toBeVisible();
	await expect(footer).toHaveText("Use via API");
	await expect(footer).toHaveText("Built with Gradio");
});

test("renders the text", async ({ page }) => {
	await expect(await page.getByText("Built with Gradio")).toBeVisible();
	await expect(await page.getByText("Use via API")).toBeVisible();
});
