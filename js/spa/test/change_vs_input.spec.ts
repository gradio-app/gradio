import { test, expect } from "@self/tootils";

test.describe.configure({ mode: "serial" });

test("Change counter is 0 on page load", async ({ page }) => {
	const counter = page.getByLabel("Change counter");
	await expect(counter).toHaveValue("0");
});

test("Textbox change and input events work correctly", async ({ page }) => {
	await expect(page.getByLabel("TB Input")).toBeVisible();
	await page.waitForTimeout(500);
	const textbox = page.getByLabel("TB Input");
	await textbox.press("h");
	await page.waitForTimeout(1_000);

	expect(page.getByLabel("Change counter")).toHaveValue("1");

	await expect(page.getByLabel("Textbox Input Event")).toHaveValue("h");
	await expect(
		page.getByLabel("Textbox Change Event", { exact: true })
	).toHaveValue("h");
	await expect(page.getByLabel("Textbox Change Event x2")).toHaveValue("h");
});
