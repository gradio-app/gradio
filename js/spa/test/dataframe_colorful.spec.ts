import { test, expect } from "@gradio/tootils";

test("first couple of cells in table are highlighted correctly", async ({
	page
}) => {
	const first_td = await page.locator("tbody tr.row_odd td").first();
	await expect(first_td).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

	const second_td = await page.locator("tbody tr.row_odd td").nth(1);
	await expect(second_td).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});
