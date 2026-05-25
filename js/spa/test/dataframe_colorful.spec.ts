import { test, expect } from "@self/tootils";

test("table cells are highlighted correctly via Styler", async ({ page }) => {
	// The demo uses highlight_max(color="lightgreen", axis=0)
	// Column A max=14 is at row 0, so cell (0,0) should be lightgreen
	const highlighted_cell = page.locator("[data-testid='cell-0-0']");
	await expect(highlighted_cell).toHaveCSS(
		"background-color",
		"rgb(144, 238, 144)"
	);

	// Column B max=54 is at row 2, so cell (2,1) should be lightgreen
	const highlighted_cell_b = page.locator("[data-testid='cell-2-1']");
	await expect(highlighted_cell_b).toHaveCSS(
		"background-color",
		"rgb(144, 238, 144)"
	);

	// Column A row 1 is not the max, so cell (1,0) should not be lightgreen
	const non_highlighted_cell = page.locator("[data-testid='cell-1-0']");
	await expect(non_highlighted_cell).not.toHaveCSS(
		"background-color",
		"rgb(144, 238, 144)"
	);
});
