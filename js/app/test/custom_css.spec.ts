import { test, expect } from "@gradio/tootils";

test("renders the correct elements", async ({ page }) => {
	await expect(page.getByTestId("markdown")).toHaveCount(2);
});

test("applies the custom CSS styles", async ({ page }) => {
	// Test for CSSKeyframesRule
	const animationName = await page
		.locator(".cool-col")
		.evaluate((node) => getComputedStyle(node).animationName);
	expect(animationName).toBe("animation");

	// Test for CSSMediaRule and CSSStyleRule
	await page.setViewportSize({ width: 500, height: 720 });
	await expect(page.locator(".markdown").nth(1)).toHaveCSS(
		"background-color",
		"rgb(0, 0, 255)"
	);
	await expect(page.locator(".markdown p")).toHaveCSS(
		"color",
		"rgb(173, 216, 230)"
	);

	await page.setViewportSize({ width: 1280, height: 720 });
	await expect(page.locator(".markdown").nth(1)).toHaveCSS(
		"background-color",
		"rgb(173, 216, 230)"
	);
	await expect(page.locator(".markdown p")).toHaveCSS(
		"color",
		"rgb(65, 105, 225)"
	);
});

test("applies the custom font family", async ({ page }) => {
	await expect(
		page.getByRole("heading", { name: "Gradio Demo with Custom CSS" })
	).toHaveCSS("font-family", "test-font");
});

test("applies resources from the @import rule", async ({ page }) => {
	await expect(page.getByText("Resize the browser window to")).toHaveCSS(
		"font-family",
		'"Protest Riot", sans-serif'
	);
});

test(".dark styles are applied corrently", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" });

	await expect(page.locator(".markdown").nth(1)).toHaveCSS(
		"background-color",
		"rgb(255, 192, 203)"
	);
	await expect(page.locator(".darktest h3")).toHaveCSS(
		"color",
		"rgb(255, 255, 0)"
	);

	await page.emulateMedia({ colorScheme: "light" });

	await expect(page.locator(".markdown").nth(1)).toHaveCSS(
		"background-color",
		"rgb(173, 216, 230)"
	);
	await expect(page.locator(".darktest h3")).toHaveCSS(
		"color",
		"rgb(31, 41, 55)"
	);
});
