import { test, expect } from "@self/tootils";

test("Walkthrough updates to next step correctly", async ({ page }) => {
	// Verify we start on step 1 (Introduction)
	await expect(page.getByText("This is the introduction step.")).toBeVisible();
	await expect(page.getByLabel("Step 1 Output")).toBeVisible();

	// Click "Next Step" to go to step 2
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 2 (Basic Information)
	await expect(page.getByText("Enter your basic information.")).toBeVisible();
	await expect(page.getByLabel("Step 2 Output")).toBeVisible();

	// Click "Next Step" to go to step 3
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 3 (Preferences)
	await expect(page.getByText("Set your preferences.")).toBeVisible();
	await expect(page.getByLabel("Step 3 Output")).toBeVisible();

	// Click "Next Step" to go to step 4
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 4 (Advanced Settings)
	await expect(page.getByText("Configure advanced settings.")).toBeVisible();
	await expect(page.getByLabel("Step 4 Output")).toBeVisible();

	// Click "Next Step" to go to step 5
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 5 (Review)
	await expect(page.getByText("Review your choices.")).toBeVisible();
	await expect(page.getByLabel("Step 5 Output")).toBeVisible();

	// Click "Next Step" to go to step 6
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 6 (Confirmation)
	await expect(page.getByText("Confirm and submit.")).toBeVisible();
	await expect(page.getByLabel("Step 6 Output")).toBeVisible();

	// Click "Next Step" to go to step 7
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 7 (Additional Options)
	await expect(page.getByText("Additional options if needed.")).toBeVisible();
	await expect(page.getByLabel("Step 7 Output")).toBeVisible();

	// Click "Next Step" to go to step 8
	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	// Verify we're on step 8 (Final Step)
	await expect(page.getByText("This is the final step!")).toBeVisible();
	await expect(page.getByLabel("Step 8 Output")).toBeVisible();
	await expect(page.getByRole("button", { name: "Complete" })).toBeVisible();
});
