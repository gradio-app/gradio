import { test, expect } from "@self/tootils";

test("ImageEditor layers are properly set", async ({ page }) => {
	await page.getByRole("button", { name: "Set Layers" }).click();
	await expect(page.getByLabel("Num Layers")).toHaveValue("1");
});
