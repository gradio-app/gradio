import { test, expect } from "@self/tootils";
import { Locator } from "@playwright/test";

// returns a cell in a dataframe by row and column indices
function get_cell(page, row, col) {
	return page.locator(`[data-row='${row}'][data-col='${col}']`).first();
}

const get_column_values = async (df: Locator): Promise<number[]> => {
	// get all the cells in the dataframe
	const cells = await df.locator(".tbody > tr > td:nth-child(2)").all();
	const values: number[] = [];
	for (const cell of cells) {
		const text = (await cell.textContent()) || "0";
		values.push(parseInt(text.trim()));
	}
	return values;
};

test("Dataframe change events work as expected", async ({ page }) => {
	await expect(page.getByLabel("Change events")).toHaveValue("0");

	await page.getByRole("button", { name: "Update dataframe" }).click();

	await expect(page.getByLabel("Change events")).toHaveValue("1");
});

test("Dataframe input events work as expected", async ({ page }) => {
	const input_events = page.getByLabel("Input events");
	await expect(input_events).toHaveValue("0");

	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	await get_cell(page, 0, 0).click();

	// Fill the cell with a new value
	await page.getByLabel("Edit cell").fill("42");
	await page.getByLabel("Edit cell").press("Enter");

	await expect(input_events).toHaveValue("1");

	// Click on the second cell in the first row
	await get_cell(page, 0, 1).click();

	await page.getByLabel("Edit cell").fill("50");
	await page.getByLabel("Edit cell").press("Enter");

	await expect(input_events).toHaveValue("2");
});

test("Dataframe select events work as expected", async ({ page }) => {
	await expect(page.getByLabel("Select events")).toHaveValue("0");

	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	await get_cell(page, 1, 1).click();

	await expect(page.getByLabel("Select events")).toHaveValue("1");

	const selected_cell_index = await page
		.getByLabel("Selected cell index")
		.inputValue();
	expect(selected_cell_index).toContain("[1, 1]");

	const selected_cell_value = await page
		.getByLabel("Selected cell value")
		.inputValue();
	expect(selected_cell_value).not.toBe("");
});

test("Dataframe filter functionality works", async ({ page }) => {
	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	const search_input = page.getByPlaceholder("Filter...");
	await search_input.click();
	await search_input.fill("test");
	await page
		.getByRole("button", { name: "Apply filter and update dataframe values" })
		.click();

	await page.waitForTimeout(500);

	await expect(page.getByLabel("Change events")).not.toHaveValue("0");
});

test("Dataframe search functionality correctly filters rows", async ({
	page
}) => {
	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	await page.waitForSelector(`[data-row='0'][data-col='0']`);

	const all_cells_text = await page.locator("td").allTextContents();
	expect(all_cells_text.length).toBeGreaterThan(0);

	const search_term = all_cells_text[0].trim();
	const search_input = page.getByPlaceholder("Search...");

	await page.waitForSelector("input[placeholder='Search...']");
	await search_input.click();
	await search_input.fill(search_term);
	await search_input.press("Enter");

	const filtered_cells_text = await page.locator("td").allTextContents();
	expect(filtered_cells_text.length).toBeGreaterThan(0);

	const filtered_text = filtered_cells_text.join(" ").toLowerCase();
	expect(filtered_text).toContain(search_term.toLowerCase());

	await search_input.click();
	await search_input.clear();

	const restored_cells_text = await page.locator("td").allTextContents();
	expect(restored_cells_text.length).toBeGreaterThanOrEqual(
		all_cells_text.length
	);
});

test("Dataframe clear functionality works", async ({ page }) => {
	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "Clear dataframe" }).click();
	await page.waitForTimeout(500);

	const rows = await page
		.locator("[data-testid='dataframe'] .tbody > tr")
		.count();

	expect(rows).toBe(0);

	await expect(page.getByLabel("Change events")).not.toHaveValue("0");
});

test("Tall dataframe has vertical scrolling", async ({ page }) => {
	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	const tall_df_block = page.locator("#dataframe_tall");
	await expect(tall_df_block).toBeVisible();

	const visible_rows = await tall_df_block.locator(".tbody > tr").count();

	expect(visible_rows).toBeGreaterThan(0);
	expect(visible_rows).toBeLessThan(50);

	const column_count = await tall_df_block.locator(".thead > tr > th").count();
	expect(column_count).toBe(4);
});

test("Tall dataframe updates with buttons", async ({ page }) => {
	await page.getByRole("button", { name: "Clear dataframe" }).click();
	await page.waitForTimeout(500);

	const tall_df_block = page.locator("#dataframe_tall");
	const empty_rows = await tall_df_block.locator(".tbody > tr").count();
	expect(empty_rows).toBe(0);

	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	const updated_rows = await tall_df_block.locator(".tbody > tr").count();
	expect(updated_rows).toBeGreaterThan(0);

	const headers = await tall_df_block
		.locator(".thead > tr > th")
		.allTextContents();

	const trimmed_headers = headers.slice(1).map((header) => header.trim());
	expect(trimmed_headers).toEqual(["A", "B", "C"]);
});

test("Non-interactive dataframe cannot be edited", async ({ page }) => {
	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	const view_df = page.locator("#non-interactive-dataframe");
	await expect(view_df).toBeVisible();

	const rows = await view_df.locator(".tbody > tr").count();
	expect(rows).toBeGreaterThan(0);

	await view_df.locator(".tbody > tr").first().locator("td").nth(1).click();
	await page.waitForTimeout(500);

	const editable_cell = await view_df
		.locator("input[aria-label='Edit cell']")
		.count();
	expect(editable_cell).toBe(0);
});
