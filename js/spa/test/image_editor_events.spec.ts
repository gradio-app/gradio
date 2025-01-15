import { test, expect, drag_and_drop_file } from "@self/tootils";

test("upload events work as expected", async ({ page }) => {
	await page.getByLabel("Upload button").first().click();
	const uploader = page.locator("input[type=file]").first();
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.locator("#upload h2")).toContainText("1");
});

test("change events work as expected", async ({ page }) => {
	const change_text = page.locator("#change h2");

	await page.getByLabel("Draw button").click();
	await page.getByLabel("Draw button").click();
	const canvas = page.locator("canvas");
	await canvas.click({ position: { x: 100, y: 100 } });
	await expect(change_text).toContainText("1");
});

test("input events work as expected", async ({ page }) => {
	const input_text = page.locator("#input h2");

	await page.getByLabel("Draw button").click();
	await page.getByLabel("Draw button").click();
	const canvas = page.locator("canvas");
	await canvas.click({ position: { x: 100, y: 100 } });
	await expect(input_text).toContainText("1");
});

test("erase triggers change and input events", async ({ page }) => {
	const canvas = page.locator("canvas");
	const input_text = page.locator("#input h2");
	const change_text = page.locator("#change h2");

	await page.getByLabel("Erase button").click();
	await canvas.click({ position: { x: 50, y: 50 } });
	await expect(input_text).toContainText("1");
	await expect(change_text).toContainText("1");
});

test("apply events work as expected", async ({ page }) => {
	const apply_text = page.locator("#apply h2");
	const apply_button = page.getByLabel("Save changes").first();

	await page.getByLabel("Draw button").first().click();
	await page.getByLabel("Draw button").first().click();
	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 100, y: 100 } });
	await apply_button.click();
	await expect(apply_text).toContainText("1");
});


test("image editor can be cleared twice by setting value to None", async ({ page }) => {
	await page.getByLabel("Draw button").first().click();
	await page.getByLabel("Draw button").first().click();
	const canvas = page.locator("canvas").first();
	await canvas.click({ position: { x: 100, y: 100 } });
	await page.getByLabel("Clear").first().click();
	const change_text = page.locator("#change h2");

	await expect(change_text).toContainText("1");
	await page.getByLabel("Draw button").first().click();
	await page.getByLabel("Draw button").first().click();
	await canvas.click({ position: { x: 100, y: 100 } });
	await canvas.click({ position: { x: 125, y: 100 } });
	await page.getByLabel("Clear").first().click();

	await expect(page.getByLabel("cleared properly")).toHaveValue("1");

});