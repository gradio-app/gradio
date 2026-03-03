import { test, expect } from "@self/tootils";

test("preserved_by_key retains typed value across rerenders", async ({
	page
}) => {
	// Wait for initial render (3 boxes by default)
	await expect(page.getByLabel("Default Label").first()).toBeVisible();

	// Type into the first textbox
	const firstBox = page.getByLabel("Default Label").first();
	await firstBox.fill("hello");
	await expect(firstBox).toHaveValue("hello");

	// Move slider from 3 to 4 — triggers rerender, box-0 should keep "hello"
	const slider = page.getByLabel("number input for Number of Boxes");
	await slider.fill("4");
	await expect(page.getByLabel("Default Label")).toHaveCount(4);
	await expect(page.getByLabel("Default Label").first()).toHaveValue("hello");
});

test("preserved_by_key retains value when box is removed and re-added", async ({
	page
}) => {
	await expect(page.getByLabel("Default Label").first()).toBeVisible();
	const slider = page.getByLabel("number input for Number of Boxes");

	// Type into the third textbox (index 2)
	const thirdBox = page.getByLabel("Default Label").nth(2);
	await thirdBox.fill("persist me");

	// Reduce to 2 boxes — third box disappears
	await slider.fill("2");
	await expect(page.getByLabel("Default Label")).toHaveCount(2);

	// Back to 3 boxes — third box should reappear with preserved value
	await slider.fill("3");
	await expect(page.getByLabel("Default Label")).toHaveCount(3);
	await expect(page.getByLabel("Default Label").nth(2)).toHaveValue(
		"persist me"
	);
});

test("preserved_by_key retains label changed via button click", async ({
	page
}) => {
	await expect(page.getByLabel("Default Label").first()).toBeVisible();
	await expect(page.getByLabel("Default Label")).toHaveCount(3);

	// Click the first "Change Label" button — label becomes a random letter (A-E)
	await page.getByRole("button", { name: "Change Label" }).first().click();

	// Now only 2 boxes have "Default Label" (the first one changed)
	await expect(page.getByLabel("Default Label")).toHaveCount(2);

	// Move slider from 3 to 4 to trigger rerender
	const slider = page.getByLabel("number input for Number of Boxes");
	await slider.fill("4");

	// If label was preserved, only 3 of the 4 boxes should have "Default Label"
	// (the first box keeps its changed label, the new 4th box gets "Default Label")
	await expect(page.getByLabel("Default Label")).toHaveCount(3);
});

test("non-preserved props reset on rerender", async ({ page }) => {
	await expect(page.getByLabel("Default Label").first()).toBeVisible();

	// Click "Change Label" to also change info (not in preserved_by_key)
	await page.getByRole("button", { name: "Change Label" }).first().click();
	await expect(page.getByLabel("Default Label")).toHaveCount(2);

	// Move slider to trigger rerender — info should reset to "Default Info"
	const slider = page.getByLabel("number input for Number of Boxes");
	await slider.fill("4");

	// All 4 boxes should have "Default Info" since info is not preserved
	const infoElements = page.getByText("Default Info");
	await expect(infoElements).toHaveCount(4);
});
