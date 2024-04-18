import { test, expect, drag_and_drop_file } from "@gradio/tootils";

test("upload events work as expected", async ({ page }) => {
	await page.getByLabel("Upload button").first().click();
	const uploader = page.locator("input[type=file]").first();
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	await expect(page.locator("#upload h2")).toContainText("1");
});

test("change events work as expected", async ({ page }) => {
	await page.getByLabel("Upload button").first().click();
	const uploader = page.locator("input[type=file]").first();
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	const change_text = page.locator("#change h2");
	await expect(change_text).toContainText("1");

	await page.getByLabel("Draw button").first().click();
	const canvas = page.locator("#image_editor canvas").first();
	await canvas.click({ position: { x: 100, y: 100 } });
	await expect(change_text).toContainText("2");

	await page.getByLabel("Erase button").first().click();
	await canvas.click({ position: { x: 100, y: 100 } });
	await expect(change_text).toContainText("3");

	await page.getByLabel("Clear canvas").first().click();
	await expect(change_text).toContainText("4");
});

test("input events work as expected", async ({ page }) => {
	await page.getByLabel("Upload button").first().click();
	const uploader = page.locator("input[type=file]").first();
	await uploader.setInputFiles(["./test/files/cheetah1.jpg"]);

	const input_text = page.locator("#input h2");
	await expect(input_text).toContainText("1");

	await page.getByLabel("Draw button").first().click();
	const canvas = page.locator("#image_editor canvas").first();
	await canvas.click({ position: { x: 100, y: 100 } });
	await expect(input_text).toContainText("2");

	await page.getByLabel("Erase button").first().click();
	await canvas.click({ position: { x: 100, y: 100 } });
	await expect(input_text).toContainText("3");

	await page.getByLabel("Clear canvas").first().click();
	await expect(input_text).toContainText("4");
});

test("apply events work as expected", async ({ page }) => {
	const apply_text = page.locator("#apply h2");
	const apply_button = page.getByLabel("Save changes").first();

	await page.getByLabel("Draw button").first().click();
	const canvas = page.locator("#image_editor canvas").first();
	await canvas.click({ position: { x: 100, y: 100 } });
	await apply_button.click();
	await expect(apply_text).toContainText("1");

	await page.getByLabel("Erase button").first().click();
	await canvas.click({ position: { x: 100, y: 100 } });

	await page.getByLabel("Clear canvas").first().click();
	await apply_button.click();
	await expect(apply_text).toContainText("2");
});
