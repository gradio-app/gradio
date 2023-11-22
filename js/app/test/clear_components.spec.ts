import { test, expect } from "@gradio/tootils";

test("Components value can be set via callable to a non-None value", async ({
	page
}) => {
	const textBoxValue = await page.getByLabel(`component_00`).inputValue();
	expect(textBoxValue.length).toBeGreaterThan(1);

	const sliderValue = await page.getByLabel(`component_01`).inputValue();
	expect(parseFloat(sliderValue)).toBeGreaterThan(0);

	const dropDownValue = await page.getByLabel(`component_07`).inputValue();
	expect(Array("a", "b", "c").includes(dropDownValue)).toBeTruthy();
});

test("gr.ClearButton clears every component's value", async ({ page }) => {
	await page.click("text=Get Values");
	await expect(page.getByLabel("Are all cleared?")).toHaveValue("False");
	await page.click("text=Clear");
	await page.click("text=Get Values");
	await expect(page.getByLabel("Are all cleared?")).toHaveValue("True");
});
