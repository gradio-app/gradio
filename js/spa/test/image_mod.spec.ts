import { test, expect } from "@self/tootils";

test("examples_get_updated_correctly", async ({ page }) => {
	await page.locator(".gallery-item").first().click();
	let image = await page.getByTestId("image").locator("img").first();
	await expect(await image.getAttribute("src")).toContain("cheetah1.jpg");
	await page.getByRole("button", { name: "Update Examples" }).click();

	let example_image;
	await expect(async () => {
		example_image = await page.locator(".gallery-item").locator("img").first();
		await expect(await example_image.getAttribute("src")).toContain("logo.png");
	}).toPass();

	await example_image.click();
	await expect(async () => {
		image = await page.getByTestId("image").locator("img").first();
		await expect(await image.getAttribute("src")).toContain("logo.png");
	}).toPass();
});
