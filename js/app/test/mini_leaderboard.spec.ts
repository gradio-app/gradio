import { test, expect } from "@gradio/tootils";

test("Search bar filters dataframe correctly.", async ({ page }) => {
	await page.getByTestId("textbox").fill("yam-peleg");
	await page.getByTestId("textbox").press("Enter");
	await expect(
		page
			.getByRole("button", { name: "yam-peleg/Experiment26-7B", exact: true })
			.first()
	).toBeInViewport();
});

test("Column selection adds columns to the dataframe.", async ({ page }) => {
	await expect(
		page
			.locator("#leaderboard-table svelte-virtual-table-viewport")
			.getByRole("button", { name: "Type" })
	).not.toBeInViewport();
	await page.getByLabel("Type").check();
	await expect(
		page
			.locator("#leaderboard-table svelte-virtual-table-viewport")
			.getByRole("button", { name: "Type" })
	).toBeInViewport();
});

test("Column selection removes columns to the dataframe.", async ({ page }) => {
	await expect(
		page
			.locator("#leaderboard-table svelte-virtual-table-viewport")
			.getByRole("button", { name: "ARC" })
	).toBeInViewport();
	await page.getByLabel("ARC", { exact: true }).uncheck();
	await expect(
		page
			.locator("#leaderboard-table svelte-virtual-table-viewport")
			.getByRole("button", { name: "ARC" })
	).not.toBeInViewport();
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
