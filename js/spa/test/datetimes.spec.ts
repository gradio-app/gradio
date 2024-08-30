import { test, expect } from "@self/tootils";

test("gr.DateTime shows correct values", async ({ page }) => {
	await page.locator("#date1").getByRole("textbox").first().click();
	await page
		.locator("#date1")
		.getByRole("textbox")
		.first()
		.fill("2020-10-01 10:50:00");
	await page.locator("body").first().click();
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
	await page.locator("body").first().click();
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
	await page.locator("body").first().click();
	await expect(page.getByLabel("Last Change")).toHaveValue("2000-02-22");

	await page.locator("#date2").getByRole("textbox").first().click();
	await page.locator("#date2").getByRole("textbox").first().fill("2020-05-02");
	await page.locator("body").first().click();
	await expect(page.getByLabel("Last Change")).toHaveValue("2020-05-02");

	await page.locator("#date3").getByRole("textbox").first().click();
	await page
		.locator("#date3")
		.getByRole("textbox")
		.first()
		.fill("2020-10-10 05:01:01");
	await page.getByRole("button", { name: "Load Date 3" }).click();
	await expect(page.getByLabel("Last Load")).toHaveValue("1602298861.0");
});
