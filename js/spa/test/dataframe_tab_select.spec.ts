import { test, expect } from "@self/tootils";

// Regression test for https://github.com/gradio-app/gradio/issues/13198
//
// Switching to a tab whose `.select` listener populates a Dataframe used to
// trigger an infinite reactive loop in the TanStack table adapter (TanStack's
// automatic page-index reset fired `setState` on every row-model recompute,
// which our adapter turned into a `version` bump that re-ran the row-model
// `$derived`, re-firing the reset). That loop saturated the microtask queue
// and froze the browser tab. These assertions would time out if it regressed.
test("switching to a tab that populates a dataframe does not freeze", async ({
	page
}) => {
	const df = page.locator("#tab_df");

	// No data rows are present before the tab is selected.
	await expect(df.getByTestId("cell-0-1")).toHaveCount(0);

	await page.getByRole("tab", { name: "Tab 2" }).click();

	// The select event populates the dataframe with 10 rows (the "Name" column
	// is col 1). If the page froze, these assertions would time out.
	await expect(df.getByTestId("cell-0-1")).toContainText("Item 0");
	await expect(df.getByTestId("cell-9-1")).toContainText("Item 9");

	// The main thread must still be responsive after rendering: a frozen page
	// could not switch back to Tab 1.
	await page.getByRole("tab", { name: "Tab 1" }).click();
	await expect(page.getByText("Click 'Tab 2'.")).toBeVisible();
});
