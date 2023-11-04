import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	const textboxes = await page.getByLabel("Input");

	const textboxOne = await textboxes.first();
	const textboxTwo = await textboxes.last();

	await textboxOne.fill("hi");
	await textboxTwo.fill("dawood");
	await page.click('text="Submit"');

	await expect(await page.getByLabel("Output")).toHaveValue("hi dawood");
});
