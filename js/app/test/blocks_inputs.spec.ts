import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	const textboxes = await page.getByLabel("Input");

	const textboxOne = await textboxes.first();
	const textboxTwo = await textboxes.last();

	await textboxOne.fill("hi");
	await textboxTwo.fill("dawood");
	await Promise.all([
		page.click('text="Submit"'),
		page.waitForResponse("**/run/predict")
	]);

	await expect(await page.getByLabel("Output")).toHaveValue("hi dawood");
});
