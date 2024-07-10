import { test, expect } from "@gradio/tootils";

test("gr.DateTime shows correct values", async ({ page }) => {
	await page.locator("#date1").getByRole("textbox").first().click();
	await page
		.locator("#date1")
		.getByRole("textbox")
		.first()
		.fill("2020-10-01 10:50:00");
	await page.locator("div").filter({ hasText: "Time Range" }).first().click();
	await expect(page.getByLabel("Last Change")).toHaveValue(
		"2020-10-01 10:50:00"
	);
	await expect(page.getByLabel("Last Submit")).toHaveValue("");
	await page.locator("#date1").getByRole("textbox").first().press("Enter");
	await expect(page.getByLabel("Last Submit")).toHaveValue(
		"2020-10-01 10:50:00"
	);
	await expect(page.getByLabel("Last Load")).toHaveValue("");

	await page.locator("#date2").getByRole("textbox").first().click();
	await page.locator("#date2").getByRole("textbox").first().fill("2000-02-22");
	await page.locator("div").filter({ hasText: "Time Range" }).first().click();
	await expect(page.getByLabel("Last Change")).toHaveValue("2000-02-22");

	await page.getByRole("button", { name: "Load Date 1" }).click();
	await expect(page.getByLabel("Last Load")).toHaveValue("2020-10-01 10:50:00");
	await page.getByRole("button", { name: "Load Date 2" }).click();
	await expect(page.getByLabel("Last Load")).toHaveValue("2000-02-22");

	await page.locator("#date2").getByRole("textbox").first().click();
	await page
		.locator("#date2")
		.getByRole("textbox")
		.first()
		.fill("2020-05-01xxx");
	await page.locator("div").filter({ hasText: "Time Range" }).first().click();
	await expect(page.getByLabel("Last Change")).toHaveValue("2000-02-22");

	await page.locator("#date2").getByRole("textbox").first().click();
	await page.locator("#date2").getByRole("textbox").first().fill("2020-05-02");
	await page.locator("div").filter({ hasText: "Time Range" }).first().click();
	await expect(page.getByLabel("Last Change")).toHaveValue("2020-05-02");
});

test("gr.DateTimeRange shows correct values", async ({ page }) => {
	await page.getByRole("button", { name: "Last 15m" }).click();
	await page.getByPlaceholder("To").click();
	await page.getByPlaceholder("To").fill("now - 10m");
	await page.locator("div").filter({ hasText: "Time Range" }).first().click();
	await expect(page.getByLabel("Last Change")).not.toBeEmpty();
	let last_change = await page.getByLabel("Last Change").inputValue();
	expect(last_change).toContain(",");

	await page.getByPlaceholder("From").click();
	await page.getByPlaceholder("From").fill("2020-10-10 05:01:01");
	await page.getByRole("button", { name: "Load Date Range" }).click();
	await expect(page.getByLabel("Last Load")).not.toBeEmpty();
	let last_load = await page.getByLabel("Last Load").inputValue();
	expect(last_load).toContain("1602331261");

	await page.getByRole("button", { name: "Last 24h" }).click();
	await expect(page.getByPlaceholder("From")).toHaveValue("now - 24h");
	await expect(page.getByPlaceholder("To")).toHaveValue("now");
	await page.getByRole("button", { name: "Back" }).click();
	await expect(page.getByPlaceholder("From")).toHaveValue(
		"2020-10-10 05:01:01"
	);
	await page.getByRole("button", { name: "Back" }).click();
	await expect(page.getByPlaceholder("From")).toHaveValue("now - 15m");
});
