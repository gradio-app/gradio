import { test, expect } from "@self/tootils";

test("Gallery has no status tracker and textbox has minimal status tracker", async ({
	page
}) => {
	await page.getByRole("button", { name: "Generate Images" }).click();
	await page.waitForTimeout(1000); // wait for status tracker to appear

	// gallery
	await expect(page.getByTestId("status-tracker").nth(0)).toHaveClass(/wrap/);
	await expect(page.getByTestId("status-tracker").nth(0)).toHaveClass(/hide/);

	// the textbox has a minimal status tracker
	await expect(page.getByTestId("status-tracker").nth(1)).toHaveClass(/wrap/);
	await expect(page.getByTestId("status-tracker").nth(1)).toHaveClass(
		/minimal/
	);
	await expect(page.getByTestId("status-tracker").nth(1)).not.toHaveClass(
		/hide/
	);
});
