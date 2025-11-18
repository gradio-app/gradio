import { test, expect } from "@self/tootils";

test("renders the correct elements", async ({ page }) => {
	await page.getByLabel("Input", { exact: true }).fill("hi");
	await page.getByLabel("Input 2", { exact: true }).first().fill("dawood");
	await page.click('text="Submit"');

	await expect(page.getByLabel("Output")).toHaveValue("hi dawood");
});
