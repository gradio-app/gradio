import { test, expect } from "@gradio/tootils";

test("gr.ClearButton clears every component's value", async ({ page }) => {
	await Promise.all([
		page.waitForResponse("**/run/predict"),
		page.click("text=Get Values")
	]);
	await expect(page.getByLabel("Are all cleared?")).toHaveValue("False");
	await page.click("text=Clear");
	await Promise.all([
		page.waitForResponse("**/run/predict"),
		page.click("text=Get Values")
	]);
	await expect(page.getByLabel("Are all cleared?")).toHaveValue("True");
});

test("Components can be hidden and removed from page", async ({ page }) => {
	[...Array(5).keys()].forEach(async (val) => {
		await expect(page.getByLabel(`component_0${val}`)).toBeVisible();
	});
	await Promise.all([
		page.waitForResponse("**/run/predict"),
		page.click("text=Hide")
	]);
	[...Array(5).keys()].forEach(async (val) => {
		await expect(page.getByLabel(`component_0${val}`)).not.toBeVisible();
	});
});
