import { test, expect } from "@self/tootils";

test.describe("Visibility States", () => {
	test("components with visible=true are visible and in DOM", async ({
		page
	}) => {
		const textbox = page.locator("#test-textbox");
		await expect(textbox).toBeVisible();
	});

	test("components with visible=false are removed from DOM", async ({
		page
	}) => {
		await page
			.locator("#visibility-radio")
			.getByText("Not Visible (removed)")
			.click();

		const textbox = page.locator("#test-textbox");
		await expect(textbox).not.toBeInViewport();
	});

	test("components with visible='hidden' remain in DOM but are not visible", async ({
		page
	}) => {
		await page
			.locator("#visibility-radio")
			.getByText("Hidden (in DOM)")
			.click();

		const textbox = page.locator("#test-textbox");

		await expect(textbox).not.toBeVisible();

		const textboxDisplay = await textbox.evaluate(
			(el) => window.getComputedStyle(el).display
		);

		expect(textboxDisplay).toBe("none");
	});

	test("hidden components can still trigger and respond to events", async ({
		page
	}) => {
		const incrementBtn = page.locator("#increment-button");
		const counter_output = page.locator("#counter-result textarea");

		await expect(counter_output).toHaveValue("");

		await incrementBtn.click();
		await expect(counter_output).toHaveValue("Counter Result: 1");

		await incrementBtn.click();
		await expect(counter_output).toHaveValue("Counter Result: 2");
	});

	test("hidden textbox maintains its value", async ({ page }) => {
		const textbox = page.locator("#test-textbox textarea");
		const button = page.locator("#test-button");
		const output = page.locator("#output-textbox textarea");

		// Type in the textbox while visible
		await textbox.fill("Test value");

		// Hide the textbox (keep in DOM)
		await page
			.locator("#visibility-radio")
			.getByText("Hidden (in DOM)")
			.click();
		await page.waitForTimeout(500);

		// Textbox should not be visible but still in DOM
		await expect(textbox).not.toBeVisible();
		await expect(textbox).toHaveCount(1);

		await expect(textbox).toHaveValue("Test value");

		await page
			.locator("#visibility-radio")
			.getByText("Visible")
			.first()
			.click();

		await expect(textbox).toBeVisible();
		await expect(textbox).toHaveValue("Test value");

		await button.click();
		await expect(output).toHaveValue("Retrieved value: Test value");
	});
});
