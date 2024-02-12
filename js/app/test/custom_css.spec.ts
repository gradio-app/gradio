import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	await expect(page.getByTestId("markdown")).toHaveCount(2);
});

test("applies the custom CSS styles", async ({ page }) => {
	// Test for CSSKeyframesRule

	const animationName = await page
		.locator(".cool-col")
		.evaluate((node) => getComputedStyle(node).animationName);
	expect(animationName).toBe("example");

	// Test for CSSMediaRule
	await page.setViewportSize({ width: 500, height: 720 });
	await expect(page.locator(".markdown").nth(1)).toHaveCSS("background-color", "rgb(0, 0, 255)");
	await expect(page.locator(".markdown p")).toHaveCSS("color", "rgb(173, 216, 230)");

	// Reset viewport size for other tests
	await page.setViewportSize({ width: 1280, height: 720 });
	await expect(page.locator(".markdown").nth(1)).toHaveCSS("background-color", "rgb(173, 216, 230)");
	await expect(page.locator(".markdown p")).toHaveCSS("color", "rgb(65, 105, 225)");

});
