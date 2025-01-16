import { test, expect } from "@self/tootils";

test("ImageEditor layers are properly set", async ({ page }) => {
	await page.getByRole("button", { name: "Set Layers" }).click();
    await page.getByRole("button", { name: "Get Layers" }).click();
	await expect(page.getByLabel("Num Layers")).toHaveValue("1");
});

test("Clicking on examples should properly run the function", async ({
	page
}) => {
	await page.locator(".gallery > .gallery-item").first().click();
	await expect(page.getByLabel("Example Ran")).toHaveValue("1");
});
