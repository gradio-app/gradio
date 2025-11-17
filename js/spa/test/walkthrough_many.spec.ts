import { test, expect } from "@self/tootils";

test("Walkthrough updates to next step correctly", async ({ page }) => {
	await expect(page.getByText("This is the introduction step.")).toBeVisible();
	await expect(page.getByLabel("Step 1 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("Enter your basic information.")).toBeVisible();
	await expect(page.getByLabel("Step 2 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("Set your preferences.")).toBeVisible();
	await expect(page.getByLabel("Step 3 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("Configure advanced settings.")).toBeVisible();
	await expect(page.getByLabel("Step 4 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("Review your choices.")).toBeVisible();
	await expect(page.getByLabel("Step 5 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("Confirm and submit.")).toBeVisible();
	await expect(page.getByLabel("Step 6 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("Additional options if needed.")).toBeVisible();
	await expect(page.getByLabel("Step 7 Output")).toBeVisible();

	await page.getByRole("button", { name: "Next Step" }).first().click();
	await page.waitForTimeout(300);

	await expect(page.getByText("This is the final step!")).toBeVisible();
	await expect(page.getByLabel("Step 8 Output")).toBeVisible();
	await expect(page.getByRole("button", { name: "Complete" })).toBeVisible();
});
