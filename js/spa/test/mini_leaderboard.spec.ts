import { test, expect } from "@self/tootils";

test("Search bar filters dataframe correctly.", async ({ page }) => {
	await page.getByTestId("textbox").fill("yam-peleg");
	await page.getByTestId("textbox").press("Enter");
	const cell = page.getByTestId("cell-0-1").first();
	await expect(cell).toContainText("yam-peleg/Experiment26-7B");
});

test("Column selection adds columns to the dataframe.", async ({ page }) => {
	await page.waitForSelector("#leaderboard-table");
	const typeHeaderExists =
		(await page.locator("#leaderboard-table th >> text=Type").count()) > 0;
	expect(typeHeaderExists).toBe(false);

	await page.getByLabel("Type").check();
	await page.waitForTimeout(500);

	const typeHeaderVisibleAfter =
		(await page.locator("#leaderboard-table th >> text=Type").count()) > 0;
	expect(typeHeaderVisibleAfter).toBe(true);
});

test("Column selection removes columns to the dataframe.", async ({ page }) => {
	await page.waitForSelector("#leaderboard-table");
	const arcHeaderExists =
		(await page.locator("#leaderboard-table th >> text=ARC").count()) > 0;
	expect(arcHeaderExists).toBe(true);

	await page.getByLabel("ARC", { exact: true }).uncheck();
	await page.waitForTimeout(500);

	const arcHeaderVisibleAfter =
		(await page.locator("#leaderboard-table th >> text=ARC").count()) > 0;
	expect(arcHeaderVisibleAfter).toBe(false);
});

test("Model Types Checkbox filters models from the table", async ({ page }) => {
	await expect(
		page.getByRole("button", { name: "Qwen/Qwen-72B", exact: true }).first()
	).not.toBeInViewport();
	await page.getByLabel("🔶").uncheck();
	await page.getByLabel("💬").uncheck();
	await page.getByLabel("🤝").uncheck();
	await expect(
		page.getByRole("button", { name: "Qwen/Qwen-72B", exact: true }).first()
	).toBeInViewport();
});
