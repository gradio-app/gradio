import { test, expect } from "@self/tootils";

test("Walkthrough step buttons allow re-navigating forward after going back", async ({
	page
}) => {
	// Step 0 should be visible initially
	await expect(
		page.getByRole("button", { name: "go to prompt" })
	).toBeVisible();

	// Navigate to step 1 via the button (programmatic selected=1)
	await page.getByRole("button", { name: "go to prompt" }).click();
	await page.waitForTimeout(300);

	// Step 1 should now be visible
	await expect(page.getByRole("button", { name: "generate" })).toBeVisible();

	// Click the step 0 button in the stepper UI to go back to step 0.
	// Use data-tab-id since the button text changes (checkmark SVG) when completed.
	await page.locator('[role="tab"][data-tab-id="0"]').click();
	await page.waitForTimeout(300);

	// Step 0 should be visible again
	await expect(
		page.getByRole("button", { name: "go to prompt" })
	).toBeVisible();

	// Now try to navigate forward again to step 1 — this is the bug scenario.
	// Without the fix, this click has no effect because the parent's
	// gradio.props.selected is still 1 (never synced back when the user
	// clicked the stepper button to go back to step 0).
	await page.getByRole("button", { name: "go to prompt" }).click();
	await page.waitForTimeout(300);

	// Step 1 should be visible again
	await expect(page.getByRole("button", { name: "generate" })).toBeVisible();
});
