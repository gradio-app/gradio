import { test, expect } from "@self/tootils";
import { Locator } from "@playwright/test";

// returns a cell in a dataframe by row and column indices
function get_cell(element: Locator, row: number, col: number) {
	return element.locator(`[data-row='${row}'][data-col='${col}']`);
}

const get_column_values = async (df: Locator): Promise<number[]> => {
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

	const df = page.locator("#dataframe");
	await get_cell(df, 0, 0).click();

	await page.getByLabel("Edit cell").fill("42");
	await page.getByLabel("Edit cell").press("Enter");

	await expect(input_events).toHaveValue("1");

	await get_cell(df, 0, 1).click();

	await page.getByLabel("Edit cell").fill("50");
	await page.getByLabel("Edit cell").press("Enter");

	await expect(input_events).toHaveValue("2");
});

test("Dataframe select events work as expected", async ({ page }) => {
	await expect(page.getByLabel("Select events")).toHaveValue("0");

	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	const dataframe = page.locator("#dataframe");
	await get_cell(dataframe, 1, 1).click();

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

test("Dataframe filter functionality works correctly", async ({ page }) => {
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

test("Dataframe search functionality works correctly", async ({ page }) => {
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

test("Dataframe keyboard operations work as expected", async ({ page }) => {
	const df = page.locator("#dataframe").first();

	await get_cell(df, 0, 0).dblclick();
	await page.getByLabel("Edit cell").fill("test_delete_value");
	await page.getByLabel("Edit cell").press("Enter");

	await get_cell(df, 0, 1).dblclick();
	await page.getByLabel("Edit cell").fill("test_backspace_value");
	await page.getByLabel("Edit cell").press("Enter");
	await page.waitForTimeout(100);

	await get_cell(df, 1, 0).dblclick();
	await page.getByLabel("Edit cell").fill("test_copy_value");
	await page.getByLabel("Edit cell").press("Enter");
	await page.waitForTimeout(100);

	// test delete key
	await get_cell(df, 0, 0).click();
	await page.waitForTimeout(100);
	await page.keyboard.press("Delete");

	expect(await get_cell(df, 0, 0).locator("input").textContent()).toBe("");

	// test backspace key
	await get_cell(df, 0, 1).click();
	await page.waitForTimeout(100);
	await page.keyboard.press("Backspace");

	// test copy key
	await get_cell(df, 1, 0).click();
	await page.keyboard.press("ControlOrMeta+c");
	await page.waitForTimeout(300);

	const clipboard_value = await page.evaluate(() =>
		navigator.clipboard.readText()
	);
	expect(clipboard_value).toBe("test_copy_value");
});

test("Dataframe shift+click selection works", async ({ page }) => {
	const df = page.locator("#dataframe").first();

	await get_cell(df, 1, 2).dblclick();
	await page.getByLabel("Edit cell").fill("6");
	await page.getByLabel("Edit cell").press("Enter");
	await page.waitForTimeout(100);

	await get_cell(df, 2, 2).dblclick();
	await page.getByLabel("Edit cell").fill("6");
	await page.getByLabel("Edit cell").press("Enter");
	await page.waitForTimeout(100);

	await get_cell(df, 1, 2).click();
	await page.keyboard.down("Shift");
	await get_cell(df, 2, 1).click();
	await page.keyboard.up("Shift");
	await page.waitForTimeout(100);

	await page.keyboard.press("ControlOrMeta+c");

	const clipboard_value = await page.evaluate(() =>
		navigator.clipboard.readText()
	);

	expect(clipboard_value).toBe("0,6\n0,6");
});

test("Dataframe cmd + click selection works", async ({ page }) => {
	const df = page.locator("#dataframe").first();

	await get_cell(df, 1, 2).dblclick();
	await page.getByLabel("Edit cell").fill("6");
	await page.getByLabel("Edit cell").press("Enter");

	await get_cell(df, 2, 2).dblclick();
	await page.getByLabel("Edit cell").fill("8");
	await page.getByLabel("Edit cell").press("Enter");
	await page.waitForTimeout(100);

	await get_cell(df, 1, 2).click();

	await get_cell(df, 2, 2).click({
		modifiers: ["ControlOrMeta"]
	});

	await page.waitForTimeout(100);

	await page.keyboard.press("ControlOrMeta+c");

	const clipboard_value = await page.evaluate(() =>
		navigator.clipboard.readText()
	);

	expect(clipboard_value).toBe("6\n8");
});

test("Static columns cannot be edited", async ({ page }) => {
	const static_df = page.locator("#dataframe");

	const static_column_cell = get_cell(static_df, 0, 4);
	await static_column_cell.click();
	await page.waitForTimeout(100);

	const is_disabled =
		(await static_column_cell.locator("input").getAttribute("disabled")) !==
		null;
	expect(is_disabled).toBe(true);

	const editable_cell = get_cell(static_df, 2, 3);
	await editable_cell.click();
	await page.waitForTimeout(100);

	const is_not_disabled = await editable_cell
		.locator("input")
		.getAttribute("aria-disabled");
	expect(is_not_disabled).toEqual("false");
});

test("Dataframe search functionality works correctly after data update", async ({
	page
}) => {
	const df = page.locator("#non-interactive-dataframe");
	await page.getByRole("button", { name: "Update dataframe" }).click();
	await page.waitForTimeout(500);

	const initial_row_count = await df.locator("tbody tr").count();

	const search_input = df.locator("input.search-input");
	await search_input.fill("14");
	await search_input.press("Enter");

	await page.waitForTimeout(100);
	const filtered_row_count = await df.locator("tbody tr").count();
	expect(filtered_row_count).toEqual(5);

	await search_input.clear();
	await search_input.press("Enter");
	await page.waitForTimeout(100);

	const restored_row_count = await df.locator("tbody tr").count();
	expect(restored_row_count).toEqual(initial_row_count);

	await search_input.fill("81");
	await search_input.press("Enter");

	await page.waitForTimeout(100);
	const filtered_after_update = await df.locator("tbody tr").count();
	expect(filtered_after_update).toEqual(2);
});
