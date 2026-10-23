import { test, expect } from "@self/tootils";

test("renders the correct elements", async ({ page }) => {
	// The first example is loaded into the inputs when the page loads; wait
	// for it, so that it does not replace what is typed below
	await expect(page.getByLabel("Input 2", { exact: true }).first()).toHaveValue(
		"Adam"
	);
	await page.getByLabel("Input", { exact: true }).fill("hi");
	await page.getByLabel("Input 2", { exact: true }).first().fill("dawood");
	await page.click('text="Submit"');

	await expect(page.getByLabel("Output")).toHaveValue("hi dawood");
});
