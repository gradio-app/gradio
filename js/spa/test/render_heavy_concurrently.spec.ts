import { test, expect } from "@self/tootils";

test("1000 total textboxes render", async ({ page }) => {
	await page.getByText("DONE 1", { exact: false }).click();
	await page.getByText("DONE 2", { exact: false }).click();

	const textboxes = await page.getByLabel("Textbox").all();
	expect(textboxes).toHaveLength(1000);
});
